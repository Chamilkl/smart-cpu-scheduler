from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Process:
    pid: str
    arrival_time: int
    burst_time: int
    priority: int = 1
    remaining_time: int = field(init=False)
    completion_time: int = field(init=False, default=0)
    start_time: int = field(init=False, default=-1)
    waiting_time: int = field(init=False, default=0)
    turnaround_time: int = field(init=False, default=0)
    response_time: int = field(init=False, default=-1)

    def __post_init__(self):
        self.remaining_time = self.burst_time

@dataclass
class GanttSlot:
    pid: str
    start: int
    end: int
