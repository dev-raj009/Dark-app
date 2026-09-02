import React from "react";
import {
  Landmark,
  Atom,
  Stethoscope,
  Building2,
  Briefcase,
  Cpu,
  BarChart3,
  GraduationCap,
  Calculator,
  Scale,
  Languages,
  Globe,
  Compass,
  Laptop,
  BookOpen,
  Sparkles,
  Shield,
  Code,
  Microscope,
  School,
  FileText,
  Wrench,
  Trophy,
  BookMarked,
} from "lucide-react";

export function getCategoryIconComponent(goalUid: string) {
  switch (goalUid) {
    case "KSCGY": // UPSC
      return Landmark;
    case "TMUVD": // JEE
      return Atom;
    case "YOTUH": // NEET
    case "SDDOC": // NEET PG
      return Stethoscope;
    case "VLEMN": // SSC
      return Building2;
    case "RTPSX": // Bank
      return Briefcase;
    case "PESHE": // GATE
    case "NVLIA":
      return Cpu;
    case "XNDUS": // CAT
    case "MAFGF": // GRE
    case "LGQVU": // GMAT
      return BarChart3;
    case "TEWDQ": // UGC NET
    case "BIZXQ": // CSIR NET
      return GraduationCap;
    case "BBKWG": // CA
      return Calculator;
    case "MRZFY": // Law
      return Scale;
    case "DZVHL": // IELTS
    case "EWFJR": // English
      return Languages;
    case "NJHPJ": // Campus Placements
      return Laptop;
    case "DOKOV": // Programming
      return Code;
    case "SUVLV": // Class 9
    case "GSZGO": // Class 10
    case "GWDPZ": // Class 11
    case "PLWCX": // Class 12
      return BookOpen;
    case "DOZGI": // Personal Dev
      return Sparkles;
    case "TUNWK": // CDS/AFCAT
    case "DANNJ": // NDA
      return Shield;
    case "SIFWL": // IIT JAM
      return Microscope;
    case "GMXMZ": // TET
    case "IFKUZ":
    case "WXKBF":
    case "SWBEI":
    case "WJWZU":
      return School;
    case "MCRYW": // CS
      return FileText;
    case "QFJOA": // ESE
      return Wrench;
    case "TPSBK": // NTSE
      return Trophy;
    case "QJEJG": // Railway
      return Compass;
    default:
      return Globe;
  }
}

export function CategoryIcon({ uid, className = "h-4 w-4" }: { uid: string; className?: string }) {
  const IconComp = getCategoryIconComponent(uid);
  return <IconComp className={className} />;
}
