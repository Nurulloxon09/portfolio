// Made-up center for the uteach teacher demo. Nothing here is real: names, groups and scores are invented.

export type Status = "present" | "late" | "absent" | "excused";
export type Course = "SAT" | "IELTS";

export type Student = {
  name: string;
  /** Previous mock, latest mock and target (SAT total or IELTS overall band) */
  before: number;
  latest: number;
  target: number;
  /** Section scores of the latest mock: SAT [R&W, Math], IELTS [L, R, W, S] */
  sections: number[];
};

export type Group = {
  id: string;
  name: string;
  course: Course;
  room: number;
  /** ISO weekdays, 1 = Monday */
  days: number[];
  start: string;
  end: string;
  /** Today's topic, filled in on the attendance sheet */
  topic: string;
  /** Attendance over the last month, in percent */
  attendance: number;
  color: "indigo" | "violet" | "orange" | "teal";
  students: Student[];
};

const sat = (name: string, before: number, rw: number, math: number, target: number): Student => ({
  name,
  before,
  latest: rw + math,
  target,
  sections: [rw, math],
});

const ielts = (name: string, before: number, sections: number[], target: number): Student => ({
  name,
  before,
  // Overall band: the average of the four, rounded to the nearest half
  latest: Math.round((sections.reduce((a, b) => a + b, 0) / 4) * 2) / 2,
  target,
  sections,
});

export const GROUPS: Group[] = [
  {
    id: "sat-math",
    name: "SAT Math · Morning",
    course: "SAT",
    room: 101,
    days: [1, 3, 5],
    start: "09:00",
    end: "10:30",
    topic: "Systems of linear equations",
    attendance: 94,
    color: "indigo",
    students: [
      sat("Aziza Karimova", 1280, 650, 690, 1450),
      sat("Bekzod Tursunov", 1350, 680, 730, 1500),
      sat("Dilnoza Rahimova", 1190, 610, 650, 1400),
      sat("Jasur Aliyev", 1420, 700, 770, 1500),
      sat("Madina Yusupova", 1240, 630, 670, 1400),
      sat("Otabek Nazarov", 1300, 640, 690, 1450),
      sat("Sevara Ismoilova", 1460, 720, 790, 1500),
    ],
  },
  {
    id: "sat-rw",
    name: "SAT Reading & Writing",
    course: "SAT",
    room: 102,
    days: [2, 4, 6],
    start: "11:00",
    end: "12:30",
    topic: "Transitions and rhetorical synthesis",
    attendance: 91,
    color: "violet",
    students: [
      sat("Akmal Qodirov", 1210, 620, 670, 1400),
      sat("Feruza Saidova", 1330, 700, 680, 1450),
      sat("Islom Mirzayev", 1150, 590, 630, 1350),
      sat("Kamola Ergasheva", 1390, 730, 710, 1500),
      sat("Laziz Hamidov", 1260, 650, 660, 1400),
      sat("Nodira Xolmatova", 1440, 760, 730, 1500),
      sat("Sardor Abdullayev", 1180, 600, 650, 1400),
    ],
  },
  {
    id: "sat-weekend",
    name: "SAT Weekend Intensive",
    course: "SAT",
    room: 102,
    days: [6, 7],
    start: "14:00",
    end: "15:30",
    topic: "Timed practice: full test",
    attendance: 96,
    color: "orange",
    students: [
      sat("Asal Normatova", 1370, 700, 720, 1500),
      sat("Doniyor Ochilov", 1220, 620, 660, 1400),
      sat("Elyor Fayzullayev", 1300, 650, 710, 1450),
      sat("Hilola Qosimova", 1410, 720, 730, 1450),
      sat("Mirjalol Xasanov", 1160, 590, 640, 1350),
      sat("Zarina Bakirova", 1280, 660, 670, 1450),
    ],
  },
  {
    id: "ielts",
    name: "IELTS Evening",
    course: "IELTS",
    room: 101,
    days: [1, 2, 3, 4, 5, 6],
    start: "17:00",
    end: "18:30",
    topic: "Writing Task 2: opinion essays",
    attendance: 88,
    color: "teal",
    students: [
      ielts("Bobur Sharipov", 6, [7, 6.5, 6, 6.5], 7),
      ielts("Gulnoza Toshpulatova", 6.5, [7.5, 7, 6.5, 7], 7),
      ielts("Jahongir Umarov", 5.5, [6.5, 6, 5.5, 6], 6.5),
      ielts("Malika Sobirova", 6, [6.5, 7, 6, 6.5], 7),
      ielts("Nurbek Murodov", 5.5, [6, 6.5, 5.5, 6], 6.5),
      ielts("Shahnoza Valiyeva", 6.5, [7, 7.5, 6.5, 7], 7.5),
      ielts("Ulugbek Raximov", 6, [6.5, 6, 5.5, 6], 6.5),
    ],
  },
];

/** The first lesson of the day comes already marked, so the list shows both states. */
export const FIRST_LESSON_MARKS: Status[] = ["present", "present", "late", "present", "absent", "present", "present"];

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
