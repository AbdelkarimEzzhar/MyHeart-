from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ReportStatus(str, Enum):
    PENDING   = "pending"
    COMPLETED = "completed"
    REVIEWED  = "reviewed"

class LabReportCreate(BaseModel):
    patientId:   str
    patientName: str
    doctorId:    Optional[str] = None
    doctorName:  Optional[str] = None
    testType:    str
    results:     Dict[str, Any] = {}
    status:      ReportStatus = ReportStatus.PENDING
    notes:       Optional[str] = None

class LabReportUpdate(BaseModel):
    testType:  Optional[str]          = None
    results:   Optional[Dict[str, Any]] = None
    status:    Optional[ReportStatus] = None
    notes:     Optional[str]          = None
