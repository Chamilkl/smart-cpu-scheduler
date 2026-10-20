export const ALGORITHMS = [
  { value: 'FCFS', label: 'First Come First Served', shortLabel: 'FCFS', preemptive: false, beginnerRecommended: true },
  { value: 'SJF', label: 'Shortest Job First', shortLabel: 'SJF', preemptive: false, beginnerRecommended: false },
  { value: 'SRTF', label: 'Shortest Remaining Time First', shortLabel: 'SRTF', preemptive: true, beginnerRecommended: false },
  { value: 'RR', label: 'Round Robin', shortLabel: 'RR', preemptive: true, beginnerRecommended: false },
  { value: 'PRIORITY', label: 'Priority Scheduling', shortLabel: 'Priority', preemptive: false, beginnerRecommended: false },
  { value: 'AICS', label: 'Adaptive Intelligent CPU Scheduler', shortLabel: 'AICS', preemptive: true, beginnerRecommended: false },
] as const

export const STORAGE_KEYS = {
  LANGUAGE: 'smartcpu-language',
  THEME: 'smartcpu-theme',
  ONBOARDING_COMPLETED: 'smartcpu-onboarding-completed',
  BEGINNER_MODE: 'smartcpu-beginner-mode',
} as const

export const DEFAULT_PROCESSES = [
  { pid: 'P1', arrival_time: 0, burst_time: 8, priority: 3 },
  { pid: 'P2', arrival_time: 1, burst_time: 4, priority: 1 },
  { pid: 'P3', arrival_time: 2, burst_time: 9, priority: 2 },
  { pid: 'P4', arrival_time: 3, burst_time: 5, priority: 4 },
]

export interface SamplePreset {
  id: string
  nameTh: string
  nameEn: string
  descTh: string
  descEn: string
  processes: { pid: string; arrival_time: number; burst_time: number; priority: number }[]
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'basic',
    nameTh: 'ตัวอย่างที่ 1: การจัดตารางพื้นฐาน (Basic Scheduling)',
    nameEn: 'Preset 1: Basic Scheduling',
    descTh: 'โพรเซสจำนวนน้อยและมาถึงพร้อมกันที่เวลา 0 เหมาะสำหรับการเริ่มต้นทำความเข้าใจการทำงานเบื้องต้น',
    descEn: 'Few processes arriving simultaneously at t=0, ideal for understanding basic execution order.',
    processes: [
      { pid: 'P1', arrival_time: 0, burst_time: 6, priority: 2 },
      { pid: 'P2', arrival_time: 0, burst_time: 8, priority: 1 },
      { pid: 'P3', arrival_time: 0, burst_time: 4, priority: 3 },
    ],
  },
  {
    id: 'different_arrivals',
    nameTh: 'ตัวอย่างที่ 2: เวลามาถึงต่างกัน (Different Arrival Times)',
    nameEn: 'Preset 2: Different Arrival Times',
    descTh: 'โพรเซสทยอยเข้ามาในระบบตามช่วงเวลาต่างกัน ช่วยให้เห็นการทำงานของคิวและการรอคอยอย่างชัดเจน',
    descEn: 'Processes arriving at staggered intervals, demonstrating queue transitions and waiting behavior.',
    processes: [
      { pid: 'P1', arrival_time: 0, burst_time: 7, priority: 2 },
      { pid: 'P2', arrival_time: 2, burst_time: 4, priority: 1 },
      { pid: 'P3', arrival_time: 4, burst_time: 1, priority: 3 },
      { pid: 'P4', arrival_time: 5, burst_time: 4, priority: 2 },
    ],
  },
  {
    id: 'different_bursts',
    nameTh: 'ตัวอย่างที่ 3: เวลาประมวลผลต่างกันมาก (Different Burst Times)',
    nameEn: 'Preset 3: Different Burst Times',
    descTh: 'มีทั้งงานสั้นและงานยาวปะปนกัน แสดงผลกระทบ Convoy Effect ใน FCFS และข้อดีของ SJF/SRTF',
    descEn: 'Mixed short and long jobs showing Convoy Effect in FCFS and the efficiency of SJF/SRTF.',
    processes: [
      { pid: 'P1', arrival_time: 0, burst_time: 24, priority: 3 },
      { pid: 'P2', arrival_time: 0, burst_time: 3, priority: 1 },
      { pid: 'P3', arrival_time: 0, burst_time: 3, priority: 2 },
      { pid: 'P4', arrival_time: 2, burst_time: 2, priority: 4 },
    ],
  },
]

export interface GlossaryTerm {
  id: string
  termTh: string
  termEn: string
  abbr?: string
  shortDefTh: string
  shortDefEn: string
  detailTh: string
  detailEn: string
  formula?: string
  exampleTh?: string
  exampleEn?: string
}

export const TECHNICAL_GLOSSARY: Record<string, GlossaryTerm> = {
  pid: {
    id: 'pid',
    termTh: 'รหัสกระบวนการ',
    termEn: 'Process ID',
    abbr: 'PID',
    shortDefTh: 'ชื่อหรือหมายเลขระบุตัวตนเฉพาะของแต่ละ Process ในระบบ',
    shortDefEn: 'A unique identifier assigned to each process in the system.',
    detailTh: 'ใช้เพื่อแยกแยะงานแต่ละงานที่รอรับการประมวลผลจาก CPU เช่น P1, P2, P3 โดยในระบบปฏิบัติการจริงจะเป็นตัวเลขอ้างอิงใน Process Table',
    detailEn: 'Used to distinguish individual tasks waiting for CPU execution, e.g. P1, P2, P3.',
  },
  at: {
    id: 'at',
    termTh: 'เวลามาถึง',
    termEn: 'Arrival Time',
    abbr: 'AT',
    shortDefTh: 'เวลาที่กระบวนการเข้าสู่คิวพร้อมทำงาน (Ready Queue)',
    shortDefEn: 'The point in time when a process enters the Ready Queue.',
    detailTh: 'เป็นเวลาเริ่มต้นที่ระบบปฏิบัติการรับรู้การมีอยู่ของ Process หาก AT = 0 แสดงว่างานนั้นพร้อมประมวลผลตั้งแต่เริ่มจำลองระบบ',
    detailEn: 'The initial moment the OS discovers the process. AT = 0 means ready from the very beginning.',
  },
  bt: {
    id: 'bt',
    termTh: 'เวลาประมวลผล',
    termEn: 'Burst Time',
    abbr: 'BT / CPU Burst',
    shortDefTh: 'ระยะเวลาทั้งหมดที่กระบวนการต้องการใช้ CPU ในการทำงานจนเสร็จ',
    shortDefEn: 'The total duration a process requires CPU execution to complete.',
    detailTh: 'เป็นช่วงเวลาที่ Process ต้องทำงานอยู่บน CPU จริง ไม่รวมเวลาที่ต้องรอคอยในคิวหรือรอ I/O',
    detailEn: 'Total CPU execution time required by the process, excluding queuing or I/O wait.',
  },
  ct: {
    id: 'ct',
    termTh: 'เวลาสิ้นสุด',
    termEn: 'Completion Time',
    abbr: 'CT',
    shortDefTh: 'เวลาที่กระบวนการประมวลผลเสร็จสิ้นสมบูรณ์',
    shortDefEn: 'The exact point in time when a process finishes execution completely.',
    detailTh: 'ดูได้จากจุดสิ้นสุดของแถบงานนั้นใน Gantt Chart เมื่อถึงเวลานี้โพรเซสจะออกจากระบบ',
    detailEn: 'Observed as the endpoint of the process segment on the Gantt Chart.',
  },
  tat: {
    id: 'tat',
    termTh: 'เวลารอบงาน',
    termEn: 'Turnaround Time',
    abbr: 'TAT',
    shortDefTh: 'ระยะเวลารวมตั้งแต่กระบวนการเข้ามาในระบบจนกระทั่งทำงานเสร็จสิ้น',
    shortDefEn: 'Total elapsed time from process arrival to complete execution.',
    detailTh: 'สะท้อนระยะเวลาทั้งหมดที่ผู้ใช้ต้องรอคอยงานชิ้นนั้น ยิ่งมีค่าน้อยยิ่งดี',
    detailEn: 'Reflects total time spent in the system. Lower values indicate better performance.',
    formula: 'TAT = Completion Time (CT) - Arrival Time (AT)',
    exampleTh: 'ถ้า P1 มาถึงที่เวลา 0 และเสร็จที่เวลา 10 ➔ TAT = 10 - 0 = 10 ms',
    exampleEn: 'If P1 arrives at t=0 and finishes at t=10 ➔ TAT = 10 - 0 = 10 ms',
  },
  wt: {
    id: 'wt',
    termTh: 'เวลารอคอย',
    termEn: 'Waiting Time',
    abbr: 'WT',
    shortDefTh: 'ระยะเวลารวมที่กระบวนการต้องนั่งรออยู่ใน Ready Queue เพื่อรอใช้ CPU',
    shortDefEn: 'Total amount of time spent waiting in the ready queue for CPU allocation.',
    detailTh: 'เป็นตัวชี้วัดสำคัญที่สุดในการวัดความคุ้มค่าของการจัดตาราง CPU ยิ่งค่าเฉลี่ยน้อยแปลว่าระบบจัดคิวได้ดี',
    detailEn: 'The primary metric for scheduling efficiency. Lower average waiting time is better.',
    formula: 'WT = Turnaround Time (TAT) - Burst Time (BT)',
    exampleTh: 'ถ้า P1 มี TAT = 10 ms แต่ใช้เวลาประมวลผลจริง BT = 4 ms ➔ WT = 10 - 4 = 6 ms',
    exampleEn: 'If P1 has TAT = 10 ms and BT = 4 ms ➔ WT = 10 - 4 = 6 ms',
  },
  rt: {
    id: 'rt',
    termTh: 'เวลาตอบสนอง',
    termEn: 'Response Time',
    abbr: 'RT',
    shortDefTh: 'ระยะเวลาตั้งแต่กระบวนการเข้ามาในระบบ จนกระทั่งได้รับ CPU ทำงานครั้งแรก',
    shortDefEn: 'Time from process arrival until it first gets allocated CPU time.',
    detailTh: 'สำคัญมากในระบบโต้ตอบ (Interactive Systems) เช่น การพิมพ์คีย์บอร์ดแล้วหน้าจอแสดงผลทันที',
    detailEn: 'Crucial for interactive systems where quick initial feedback is essential.',
    formula: 'RT = เวลาที่ได้รับ CPU ครั้งแรก - Arrival Time (AT)',
    exampleTh: 'P2 มาถึงที่เวลา 2 ได้รับ CPU ทำงานครั้งแรกที่เวลา 5 ➔ RT = 5 - 2 = 3 ms',
    exampleEn: 'P2 arrives at t=2 and first receives CPU at t=5 ➔ RT = 5 - 2 = 3 ms',
  },
  priority: {
    id: 'priority',
    termTh: 'ลำดับความสำคัญ',
    termEn: 'Priority',
    shortDefTh: 'ระดับความสำคัญของงาน (ระบบนี้กำหนดให้ตัวเลขน้อย = ความสำคัญสูงสุด เช่น 1 คือด่วนที่สุด)',
    shortDefEn: 'Urgency level of a process (In this system, lower number = higher priority; 1 is highest).',
    detailTh: 'ใช้ใน Priority Scheduling เพื่อให้งานด่วน เช่น งานระบบหรือการขัดจังหวะสำคัญ ได้ประมวลผลก่อนงานทั่วไป',
    detailEn: 'Used in Priority Scheduling to allow urgent tasks to preempt or execute ahead of lower priority tasks.',
  },
  tq: {
    id: 'tq',
    termTh: 'ควอนตัมเวลา',
    termEn: 'Time Quantum',
    abbr: 'TQ / Time Slice',
    shortDefTh: 'ช่วงเวลาคงที่สูงสุดที่ CPU อนุญาตให้แต่ละกระบวนการทำงานต่อเนื่องใน Round Robin',
    shortDefEn: 'Fixed maximum time slice allocated to each process continuously in Round Robin.',
    detailTh: 'ถ้าหมดเวลา Quantum แล้วงานยังไม่เสร็จ CPU จะหยุดงานนั้นและสลับไปให้งานถัดไปในคิวทำแทน',
    detailEn: 'If time expires before completion, CPU is preempted and allocated to the next ready process.',
  },
  cpu_util: {
    id: 'cpu_util',
    termTh: 'อัตราการใช้ CPU',
    termEn: 'CPU Utilization',
    shortDefTh: 'ร้อยละของเวลาที่ CPU กำลังทำงานจริงเทียบกับเวลาทั้งหมด',
    shortDefEn: 'Percentage of total time that the CPU is busy executing processes.',
    detailTh: 'ระบบที่ดีควรมีอัตราการใช้ CPU สูง (ใกล้ 100%) เพื่อไม่ให้หน่วยประมวลผลว่างงานโดยเปล่าประโยชน์',
    detailEn: 'Higher utilization (near 100%) indicates efficient resource usage without idle waste.',
    formula: 'CPU Utilization (%) = (เวลาที่ CPU ทำงานจริง ÷ เวลารวมทั้งหมด) × 100',
  },
  throughput: {
    id: 'throughput',
    termTh: 'ปริมาณงานที่ประมวลผลได้',
    termEn: 'Throughput',
    shortDefTh: 'จำนวนกระบวนการที่ทำงานเสร็จสิ้นต่อหนึ่งหน่วยเวลา',
    shortDefEn: 'Number of completed processes per unit of time.',
    detailTh: 'ยิ่งระบบประมวลผลงานเสร็จได้จำนวนมากในเวลาสั้น ค่า Throughput ยิ่งสูง',
    detailEn: 'Measures completion speed. More completed tasks per time unit means higher throughput.',
    formula: 'Throughput = จำนวนกระบวนการทั้งหมดที่ทำเสร็จ ÷ เวลารวมทั้งหมด',
  },
  context_switch: {
    id: 'context_switch',
    termTh: 'การสลับบริบท',
    termEn: 'Context Switch',
    abbr: 'CS',
    shortDefTh: 'การที่ CPU หยุดทำงานของโพรเซสหนึ่ง แล้วเปลี่ยนไปทำงานให้อีกโพรเซสหนึ่ง',
    shortDefEn: 'Switching CPU execution from one process to another.',
    detailTh: 'ในระบบจริง การสลับบริบทต้องมีการบันทึกสถานะ Register และโหลดสถานะใหม่ ซึ่งมีต้นทุนเวลา (Overhead)',
    detailEn: 'In real operating systems, saving and loading process states incurs time overhead.',
  },
  preemptive: {
    id: 'preemptive',
    termTh: 'การจัดตารางแบบแทรกกลางคัน',
    termEn: 'Preemptive Scheduling',
    shortDefTh: 'ระบบสามารถบังคับหยุด (แย่ง CPU) งานที่กำลังรันอยู่ เพื่อให้งานอื่นที่สำคัญกว่าทำงานแทนได้',
    shortDefEn: 'CPU can forcibly interrupt a running process to give CPU to a more urgent task.',
    detailTh: 'เช่น SRTF (Shortest Remaining Time First) และ Round Robin เมื่อมีงานสั้นกว่าเข้ามา หรือหมด Time Quantum จะถูกแย่ง CPU ทันที',
    detailEn: 'Examples: SRTF and Round Robin. Running processes can be interrupted before completing.',
  },
  non_preemptive: {
    id: 'non_preemptive',
    termTh: 'การจัดตารางแบบไม่แทรกกลางคัน',
    termEn: 'Non-preemptive Scheduling',
    shortDefTh: 'เมื่องานใดได้รับ CPU แล้ว จะทำงานต่อเนื่องไปจนเสร็จสิ้น โดยไม่มีงานอื่นมาแย่งได้',
    shortDefEn: 'Once a process gains the CPU, it runs uninterrupted until completion.',
    detailTh: 'เช่น FCFS และ Non-preemptive SJF ข้อดีคือจัดการง่าย ไม่มีการสลับบริบทบ่อย ข้อเสียอาจทำให้งานสั้นต้องรอนาน',
    detailEn: 'Examples: FCFS and SJF. Simpler overhead, but short processes may experience long delays.',
  },
}
