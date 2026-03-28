from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from app.database import collection
from app.models import LabReportCreate, LabReportUpdate
from datetime import datetime

router = APIRouter(prefix="/api/lab-reports", tags=["Lab Reports"])

def serialize(report) -> dict:
    return {
        "id":          str(report["_id"]),
        "patientId":   report.get("patientId"),
        "patientName": report.get("patientName"),
        "doctorId":    report.get("doctorId"),
        "doctorName":  report.get("doctorName"),
        "testType":    report.get("testType"),
        "results":     report.get("results", {}),
        "status":      report.get("status"),
        "notes":       report.get("notes"),
        "createdAt":   str(report.get("createdAt")),
    }

@router.get("")
async def get_all():
    reports = []
    async for r in collection.find().sort("createdAt", -1):
        reports.append(serialize(r))
    return reports

@router.get("/{report_id}")
async def get_one(report_id: str):
    r = await collection.find_one({"_id": ObjectId(report_id)})
    if not r:
        raise HTTPException(status_code=404, detail="Lab report not found")
    return serialize(r)

@router.post("", status_code=201)
async def create(report: LabReportCreate):
    data = report.dict()
    data["createdAt"] = datetime.utcnow()
    result = await collection.insert_one(data)
    created = await collection.find_one({"_id": result.inserted_id})
    return serialize(created)

@router.put("/{report_id}")
async def update(report_id: str, report: LabReportUpdate):
    update_data = {k: v for k, v in report.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await collection.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": update_data}
    )
    updated = await collection.find_one({"_id": ObjectId(report_id)})
    if not updated:
        raise HTTPException(status_code=404, detail="Lab report not found")
    return serialize(updated)

@router.delete("/{report_id}", status_code=204)
async def delete(report_id: str):
    await collection.delete_one({"_id": ObjectId(report_id)})
