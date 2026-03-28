from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.lab_reports import router
import os
import uuid
import threading

app = FastAPI(
    title="Lab Report Service",
    description="MyHeart Healthcare — Lab Report Microservice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "UP", "service": "lab-report-service"}


# Consul registration (best-effort)
def register_with_consul():
    try:
        import consul
        CONSUL_HOST = os.getenv('CONSUL_HOST', 'consul')
        CONSUL_PORT = int(os.getenv('CONSUL_PORT', '8500'))
        SERVICE_NAME = os.getenv('SERVICE_NAME', 'lab-report-service')
        SERVICE_PORT = int(os.getenv('SERVICE_PORT', '8084'))
        SERVICE_ID = f"{SERVICE_NAME}-{SERVICE_PORT}-{uuid.uuid4().hex[:6]}"

        c = consul.Consul(host=CONSUL_HOST, port=CONSUL_PORT)
        # Using the service name as Address so other services can resolve via docker DNS
        c.agent.service.register(name=SERVICE_NAME, service_id=SERVICE_ID,
                                 address=SERVICE_NAME, port=SERVICE_PORT,
                                 check={
                                     'HTTP': f'http://{SERVICE_NAME}:{SERVICE_PORT}/health',
                                     'Interval': '10s',
                                     'DeregisterCriticalServiceAfter': '1m'
                                 })
        print(f"Registered {SERVICE_NAME} with Consul at {CONSUL_HOST}:{CONSUL_PORT} (id={SERVICE_ID})")

        def dereg():
            try:
                c.agent.service.deregister(SERVICE_ID)
                print(f"Deregistered {SERVICE_ID}")
            except Exception:
                pass

        import atexit
        atexit.register(dereg)
    except Exception as e:
        print('Consul registration failed (continuing):', e)


# Run registration in background thread so startup isn't blocked
threading.Thread(target=register_with_consul, daemon=True).start()
