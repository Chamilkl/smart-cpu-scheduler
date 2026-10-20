from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProcessInput(BaseModel):
    pid: str = Field(..., min_length=1, max_length=20, description="Process ID")
    arrival_time: int = Field(..., ge=0, description="Arrival Time (ms)")
    burst_time: int = Field(..., ge=1, description="Burst Time (ms)")
    priority: int = Field(default=1, ge=1, le=10, description="Priority (1=highest)")

    @validator('pid')
    def validate_pid(cls, v):
        if not v.strip():
            raise ValueError('Process ID cannot be empty')
        return v.strip()

class SimulationRequest(BaseModel):
    processes: List[ProcessInput] = Field(..., min_items=1, max_items=100)
    algorithm: str = Field(..., description="Algorithm: FCFS|SJF|SRTF|RR|PRIORITY|AICS")
    time_quantum: Optional[int] = Field(default=2, ge=1, le=100, description="Time Quantum for RR")
    session_id: Optional[str] = None

    @validator('algorithm')
    def validate_algorithm(cls, v):
        valid = {'FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY', 'AICS'}
        if v.upper() not in valid:
            raise ValueError(f'Algorithm must be one of {valid}')
        return v.upper()

class GanttEntry(BaseModel):
    pid: str
    start: int
    end: int
    color: Optional[str] = None

class ProcessResult(BaseModel):
    pid: str
    arrival_time: int
    burst_time: int
    priority: int
    completion_time: int
    turnaround_time: int
    waiting_time: int
    response_time: int

class Metrics(BaseModel):
    avg_waiting_time: float
    avg_turnaround_time: float
    avg_response_time: float
    cpu_utilization: float
    throughput: float
    context_switches: int
    total_time: int

class SimulationResult(BaseModel):
    algorithm: str
    gantt_chart: List[GanttEntry]
    process_results: List[ProcessResult]
    metrics: Metrics
    aics_decision: Optional[Dict[str, Any]] = None

class CompareRequest(BaseModel):
    processes: List[ProcessInput]
    algorithms: List[str] = Field(default=['FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY'])
    time_quantum: Optional[int] = 2

class AIRecommendRequest(BaseModel):
    processes: List[ProcessInput]
    optimize_for: str = Field(default='waiting_time', description="waiting_time|turnaround_time|response_time|balanced")

class AIRecommendResponse(BaseModel):
    recommended_algorithm: str
    confidence: float
    reasoning: List[str]
    features: Dict[str, Any]
    alternative: Optional[str] = None
    comparison_preview: Optional[Dict[str, Any]] = None

class HistoryResponse(BaseModel):
    id: int
    session_id: str
    algorithm: str
    processes_input: List[Dict]
    results: Dict
    metrics: Dict
    created_at: datetime
    class Config:
        from_attributes = True
