"""
Test suite for CPU Scheduling algorithms.
Tests correctness against known reference answers.
"""
import pytest
from copy import deepcopy
from app.simulation.base import Process
from app.simulation.fcfs import simulate_fcfs
from app.simulation.sjf import simulate_sjf
from app.simulation.srtf import simulate_srtf
from app.simulation.round_robin import simulate_rr
from app.simulation.priority import simulate_priority
from app.simulation.metrics import calculate_metrics


def make_processes(data):
    """Helper to create Process objects from list of dicts"""
    return [Process(pid=d['pid'], arrival_time=d['at'], burst_time=d['bt'], priority=d.get('priority', 1)) for d in data]


# ========== FCFS Tests ==========

class TestFCFS:
    def test_basic(self):
        procs = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 24},
            {'pid': 'P2', 'at': 0, 'bt': 3},
            {'pid': 'P3', 'at': 0, 'bt': 3},
        ])
        gantt, total = simulate_fcfs(procs)
        assert procs[0].completion_time == 24
        assert procs[1].completion_time == 27
        assert procs[2].completion_time == 30
        m = calculate_metrics(procs, gantt, total)
        assert m['avg_waiting_time'] == pytest.approx(17.0, 0.01)

    def test_with_idle(self):
        procs = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 5},
            {'pid': 'P2', 'at': 10, 'bt': 3},
        ])
        gantt, total = simulate_fcfs(procs)
        assert procs[0].completion_time == 5
        assert procs[1].completion_time == 13
        assert any(s.pid == 'IDLE' for s in gantt)

    def test_single_process(self):
        procs = make_processes([{'pid': 'P1', 'at': 0, 'bt': 10}])
        gantt, total = simulate_fcfs(procs)
        m = calculate_metrics(procs, gantt, total)
        assert total == 10
        assert procs[0].turnaround_time == 10
        assert procs[0].waiting_time == 0


# ========== SJF Tests ==========

class TestSJF:
    def test_basic(self):
        """Classic SJF test: P1=6, P2=8, P3=7, P4=3 all arrive at 0"""
        procs = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 6},
            {'pid': 'P2', 'at': 0, 'bt': 8},
            {'pid': 'P3', 'at': 0, 'bt': 7},
            {'pid': 'P4', 'at': 0, 'bt': 3},
        ])
        gantt, total = simulate_sjf(procs)
        pid_ct = {p.pid: p.completion_time for p in procs}
        # Order: P4(3), P1(9), P3(16), P2(24)
        assert pid_ct['P4'] == 3
        assert pid_ct['P1'] == 9
        assert pid_ct['P3'] == 16
        assert pid_ct['P2'] == 24
        m = calculate_metrics(procs, gantt, total)
        assert m['avg_waiting_time'] == pytest.approx(7.0, 0.01)

    def test_non_preemptive(self):
        """SJF should NOT preempt running process"""
        procs = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 8},
            {'pid': 'P2', 'at': 1, 'bt': 4},
        ])
        gantt, total = simulate_sjf(procs)
        pid_ct = {p.pid: p.completion_time for p in procs}
        # P1 starts first (only process at t=0), P2 waits
        assert pid_ct['P1'] == 8
        assert pid_ct['P2'] == 12


# ========== SRTF Tests ==========

class TestSRTF:
    def test_preemption(self):
        """SRTF should preempt P1 when P2 arrives with shorter remaining time"""
        procs = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 8},
            {'pid': 'P2', 'at': 1, 'bt': 4},
        ])
        gantt, total = simulate_srtf(procs)
        pid_ct = {p.pid: p.completion_time for p in procs}
        # P2 should finish before P1
        assert pid_ct['P2'] < pid_ct['P1']
        assert pid_ct['P2'] == 5
        assert pid_ct['P1'] == 12

    def test_all_same_time(self):
        """When all arrive at same time, SRTF == SJF"""
        procs_srtf = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 6},
            {'pid': 'P2', 'at': 0, 'bt': 3},
            {'pid': 'P3', 'at': 0, 'bt': 8},
        ])
        procs_sjf = deepcopy(procs_srtf)
        for p in procs_sjf:
            p.remaining_time = p.burst_time
            p.start_time = -1
            p.response_time = -1
            p.completion_time = 0

        gantt_srtf, total_srtf = simulate_srtf(procs_srtf)
        gantt_sjf, total_sjf = simulate_sjf(procs_sjf)

        m_srtf = calculate_metrics(procs_srtf, gantt_srtf, total_srtf)
        m_sjf = calculate_metrics(procs_sjf, gantt_sjf, total_sjf)
        assert m_srtf['avg_waiting_time'] == pytest.approx(m_sjf['avg_waiting_time'], 0.01)


# ========== Round Robin Tests ==========

class TestRoundRobin:
    def test_basic_tq2(self):
        """Round Robin with TQ=2"""
        procs = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 5},
            {'pid': 'P2', 'at': 0, 'bt': 3},
            {'pid': 'P3', 'at': 0, 'bt': 4},
        ])
        gantt, total = simulate_rr(procs, time_quantum=2)
        # All processes should complete
        for p in procs:
            assert p.completion_time > 0
            assert p.remaining_time == 0
        assert total == 12

    def test_tq_larger_than_burst(self):
        """When TQ >= burst, each process runs to completion"""
        procs = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 3},
            {'pid': 'P2', 'at': 0, 'bt': 2},
        ])
        gantt, total = simulate_rr(procs, time_quantum=10)
        assert procs[0].completion_time == 3
        assert procs[1].completion_time == 5


# ========== Priority Tests ==========

class TestPriority:
    def test_priority_order(self):
        """Lower priority number = runs first"""
        procs = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 10, 'priority': 3},
            {'pid': 'P2', 'at': 0, 'bt': 5, 'priority': 1},
            {'pid': 'P3', 'at': 0, 'bt': 8, 'priority': 2},
        ])
        gantt, total = simulate_priority(procs)
        pid_ct = {p.pid: p.completion_time for p in procs}
        # P2(priority=1) should run first -> CT=5
        # P3(priority=2) -> CT=13
        # P1(priority=3) -> CT=23
        assert pid_ct['P2'] == 5
        assert pid_ct['P3'] == 13
        assert pid_ct['P1'] == 23


# ========== Metrics Tests ==========

class TestMetrics:
    def test_cpu_utilization_no_idle(self):
        procs = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 5},
            {'pid': 'P2', 'at': 5, 'bt': 5},
        ])
        gantt, total = simulate_fcfs(procs)
        m = calculate_metrics(procs, gantt, total)
        assert m['cpu_utilization'] == pytest.approx(100.0, 0.01)

    def test_waiting_time_non_negative(self):
        """Waiting times must always be >= 0"""
        procs = make_processes([
            {'pid': 'P1', 'at': 0, 'bt': 3},
            {'pid': 'P2', 'at': 1, 'bt': 2},
            {'pid': 'P3', 'at': 5, 'bt': 1},
        ])
        for algo_fn in [simulate_fcfs, simulate_sjf, simulate_priority]:
            p_copy = deepcopy(procs)
            gantt, total = algo_fn(p_copy)
            for p in p_copy:
                assert p.waiting_time >= 0, f"Negative waiting time for {p.pid}"
