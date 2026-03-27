"""
Main FastAPI application.
Integrates all routes, middleware, and WebSocket support.
"""

import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from config import settings
from api.database import init_db, SessionLocal
from api.routes import users, sessions, analytics, insights, ai_chat, admin


class ConnectionManager:
    """Manages WebSocket connections for real-time updates."""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected WebSocket clients."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        # Clean up dead connections
        for conn in disconnected:
            self.disconnect(conn)

    @property
    def connection_count(self) -> int:
        return len(self.active_connections)


# Global WebSocket manager — imported by main.py to broadcast events
manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    init_db()
    print("[OK] Database initialized")

    # Seed demo data on cloud deployments (only if database is empty)
    if not settings.DEBUG:
        try:
            from api.seed_data import seed_demo_data
            db = SessionLocal()
            try:
                seed_demo_data(db)
            finally:
                db.close()
        except Exception as e:
            print(f"[WARN] Could not seed demo data: {e}")

    # Register WebSocket manager (only if monitoring_engine is available)
    try:
        from monitoring_engine.app_state import monitoring_state
        monitoring_state.set_ws_manager(manager)
        monitoring_state.set_event_loop(asyncio.get_event_loop())
    except ImportError:
        pass  # Cloud deployment — monitoring_engine not available

    # Start periodic status ping task (every 5 seconds)
    async def status_ping():
        while True:
            await asyncio.sleep(5)
            if manager.connection_count > 0:
                try:
                    from monitoring_engine.app_state import monitoring_state
                    status = monitoring_state.get_status()
                    await manager.broadcast({
                        "type": "status",
                        "is_monitoring": status["is_monitoring"],
                        "is_idle": status["is_idle"],
                        "total_sessions": status["total_sessions"],
                        "total_screenshots": status["total_screenshots"],
                        "current_app": status["current_app"],
                    })
                except Exception:
                    pass

    asyncio.create_task(status_ping())

    yield
    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Activity Monitoring and Analytics API",
    lifespan=lifespan
)

# CORS middleware — allows all origins so the Chrome extension
# (chrome-extension://<id>) can POST browser sessions.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(analytics.router)
app.include_router(insights.router)
app.include_router(ai_chat.router)
app.include_router(admin.router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "websocket_clients": manager.connection_count}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time activity updates."""
    await manager.connect(websocket)
    try:
        # Send initial status on connect
        from monitoring_engine.app_state import monitoring_state
        status = monitoring_state.get_status()
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to Activity Monitor",
            **status
        })

        while True:
            # Keep connection alive; client can send pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""
    import traceback
    traceback.print_exc()
    print(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )
