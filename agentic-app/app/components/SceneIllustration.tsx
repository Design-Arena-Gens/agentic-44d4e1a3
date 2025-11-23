type SceneKey =
  | "hallway"
  | "doorThreshold"
  | "roomInterior"
  | "mirror"
  | "whispers"
  | "finale";

type SceneIllustrationProps = {
  sceneKey: SceneKey;
  progress: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const HallwayScene = ({ progress }: { progress: number }) => {
  const flicker =
    0.6 + Math.abs(Math.sin(progress * Math.PI * 10 + progress * 4)) * 0.5;
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background:
            "linear-gradient(180deg, #07080d 5%, #0b1422 45%, #1c0f16 85%)",
          filter: `brightness(${1.1 * flicker})`,
        }}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 15%, rgba(255,255,210,0.08) 0%, transparent 55%)",
        }}
      />
      <div className="absolute inset-x-[10%] bottom-0 h-[55%] bg-gradient-to-t from-[#0d080a] via-[#120b0f] to-transparent" />
      <div className="absolute inset-x-[20%] top-[25%] h-[55%] origin-bottom skew-y-6 border-x border-[#1d171b]/60 bg-gradient-to-tr from-[#121822] via-[#090d14] to-[#04060c]" />
      <div className="absolute inset-x-[22%] top-[28%] h-[50%] origin-bottom skew-y-6 bg-[linear-gradient(180deg,#0f141b_0%,#0f141b_30%,#07090f_30%,#07090f_100%)] shadow-[0_0_60px_rgba(128,0,0,0.25)]"></div>
      <div className="absolute left-1/2 top-[40%] h-[44%] w-[18%] -translate-x-1/2 bg-gradient-to-b from-[#1a0f13] via-[#1c070b] to-[#050204] shadow-[0_0_50px_rgba(255,0,30,0.18)]">
        <div className="absolute left-1/2 top-[14%] h-[8%] w-[56%] -translate-x-1/2 border border-[#4a2a2f] bg-[#120506] text-center text-[10px] tracking-[0.35em] text-[#f3d89b]/80">
          2 1 3
        </div>
        <div className="absolute left-1/2 top-[44%] h-[8%] w-[10%] -translate-x-1/2 rounded-full bg-[#d89f4e]/80 shadow-[0_0_12px_rgba(255,218,150,0.4)]" />
      </div>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 6px, rgba(255,255,255,0.02) 6px, rgba(255,255,255,0.02) 7px)",
        }}
      />
    </div>
  );
};

const DoorThresholdScene = ({ progress }: { progress: number }) => {
  const doorOpen = clamp(progress * 30, 0, 1);
  const lightIntensity = 0.25 + Math.sin(progress * Math.PI * 6) * 0.12;
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 15%, rgba(255,255,255,0.05) 0%, rgba(36,12,18,0.8) 55%, #040205 90%)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0d0a1b_0%,#1a0e17_45%,#050107_100%)] opacity-75" />
      <div className="absolute inset-y-[10%] left-[12%] w-[76%] bg-gradient-to-tr from-[#19090d] via-[#120406] to-[#040103] shadow-[0_0_120px_rgba(255,35,35,0.1)]">
        <div
          className="absolute inset-y-[26%] right-[24%] w-[48%] rounded-sm border border-[#371318] bg-gradient-to-b from-[#1a0a0f] via-[#0c0305] to-[#010002]"
          style={{
            transformOrigin: "right center",
            transform: `perspective(800px) rotateY(${-doorOpen * 18}deg)`,
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
          }}
        >
          <div className="absolute left-1/3 top-[46%] h-[12%] w-[10%] rounded-full bg-[#d7a85f]/90 blur-[0.5px]" />
        </div>
        <div
          className="absolute inset-y-[10%] right-[24%] w-[48%] opacity-90"
          style={{
            background:
              "radial-gradient(circle at 10% 40%, rgba(255,190,140,0.18) 0%, transparent 50%)",
            filter: `blur(${(1 - doorOpen) * 6}px)`,
          }}
        />
        <div
          className="absolute inset-y-[12%] left-[12%] w-[35%] rounded-sm bg-[#07070b]/90"
          style={{
            boxShadow: "0 0 60px rgba(255,255,255,0.08)",
          }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 48% 40%, rgba(255,200,160,0.3) 0%, transparent 60%)",
          opacity: lightIntensity,
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(10,0,0,0.07) 0px, rgba(10,0,0,0.07) 2px, transparent 2px, transparent 6px)",
        }}
      />
    </div>
  );
};

const RoomInteriorScene = ({ progress }: { progress: number }) => {
  const pulse = 0.8 + Math.sin(progress * Math.PI * 4) * 0.1;
  const redGlow = clamp(progress * 1.8, 0.2, 0.8);
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,230,170,0.12) 0%, rgba(10,6,14,0.95) 60%)",
        }}
      />
      <div className="absolute inset-x-[8%] bottom-[12%] h-[36%] rounded-t-[60%] bg-[#07060a]" />
      <div className="absolute inset-x-[20%] bottom-[30%] h-[16%] rounded-3xl bg-gradient-to-r from-[#1a1016] via-[#270a11] to-[#15060e] shadow-[0_0_50px_rgba(255,0,0,0.08)]" />
      <div className="absolute left-[14%] bottom-[36%] h-[20%] w-[22%] rounded-2xl bg-gradient-to-b from-[#0b0f18] to-[#04060b] shadow-[0_0_30px_rgba(200,0,0,0.2)]">
        <div className="absolute inset-[8%] rounded-xl bg-gradient-to-b from-[#0c121f] to-[#05070e]" />
        <div
          className="absolute inset-[22%] rounded-[40%] bg-[#f9f1e0]/10"
          style={{ opacity: redGlow }}
        />
      </div>
      <div
        className="absolute right-[18%] bottom-[34%] h-[18%] w-[28%] rounded-full bg-[#160a11]"
        style={{
          boxShadow: `0 0 55px rgba(200,10,25,${0.12 + redGlow * 0.2})`,
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 80% 35%, rgba(255,40,40,0.15) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(120deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 10px, transparent 10px, transparent 20px)",
        }}
      />
      <div
        className="absolute left-[50%] top-[32%] h-[18%] w-[36%] -translate-x-1/2 rounded-[45%] bg-[#06060a]/80"
        style={{
          boxShadow: `0 0 40px rgba(255,0,0,${0.12 + pulse * 0.08})`,
        }}
      >
        <div className="absolute inset-[22%] rounded-[50%] bg-[#aa0022]/20 blur-2xl" />
      </div>
    </div>
  );
};

const MirrorScene = ({ progress }: { progress: number }) => {
  const apparition = clamp(progress * 1.6, 0, 1);
  const shimmer = 0.6 + Math.sin(progress * Math.PI * 12) * 0.1;
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 68% 35%, rgba(255,255,255,0.06) 0%, rgba(12,8,18,0.96) 50%)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0c060c_0%,#140812_50%,#030104_100%)] opacity-70" />
      <div className="absolute right-[16%] top-[18%] h-[58%] w-[36%] rounded-[28%] border border-[#3a2c44]/80 bg-gradient-to-b from-[#0f111c] via-[#090a13] to-[#020105] shadow-[0_0_45px_rgba(255,255,255,0.12)]">
        <div
          className="absolute inset-[12%] rounded-[26%] bg-gradient-to-b from-[#090c12] via-[#040509] to-[#010102]"
          style={{
            boxShadow: "inset 0 0 40px rgba(255,255,255,0.06)",
          }}
        />
        <div
          className="absolute inset-[18%] rounded-[30%] bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.08),transparent_70%)] opacity-70 blur-[2px]"
          style={{
            transform: `scale(${1 + apparition * 0.06})`,
          }}
        />
        <div
          className="absolute inset-[20%] rounded-[30%] opacity-0 transition-opacity duration-700"
          style={{
            opacity: apparition,
          }}
        >
          <div className="absolute left-1/2 top-[24%] h-[12%] w-[38%] -translate-x-1/2 rounded-full bg-[#fce4ef]/6 blur-sm" />
          <div className="absolute left-1/2 top-[42%] h-[24%] w-[52%] -translate-x-1/2 rounded-[45%] bg-[#f7d4e4]/8 blur-md" />
          <div className="absolute left-[45%] top-[40%] h-[18%] w-[16%] rounded-full bg-[#f8f1ff]/10 blur-md" />
          <div className="absolute right-[42%] top-[40%] h-[18%] w-[16%] rounded-full bg-[#f8f1ff]/10 blur-md" />
          <div className="absolute inset-x-[35%] top-[58%] h-[18%] rounded-full bg-[#f8f1ff]/8 blur-sm" />
        </div>
      </div>
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 35%, transparent 100%)",
          transform: `scale(${1 + shimmer * 0.02})`,
        }}
      />
      <div
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 6px, transparent 6px, transparent 12px)",
        }}
      />
    </div>
  );
};

const WhisperScene = ({ progress }: { progress: number }) => {
  const wave = Math.sin(progress * Math.PI * 8);
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 40% 20%, rgba(180,10,40,0.08) 0%, rgba(5,1,5,0.94) 55%)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(140deg,#020205_0%,#0a040b_45%,#050106_100%)] opacity-90" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(255,25,25,0.25) 0%, transparent 55%)",
          transform: `scale(${1 + wave * 0.03})`,
        }}
      />
      {Array.from({ length: 5 }).map((_, idx) => {
        const offset = idx * 12;
        return (
          <div
            key={idx}
            className="absolute left-[10%] h-[12%] w-[80%] rounded-full bg-[#f5d4ff]/5 blur-2xl"
            style={{
              top: `${20 + offset}%`,
              opacity: 0.35 + Math.sin(progress * Math.PI * (idx + 1) * 1.8) *
                0.25,
            }}
          />
        );
      })}
      <div
        className="absolute inset-x-[24%] top-[35%] h-[38%] rounded-full bg-[#040103]"
        style={{
          boxShadow: "0 0 45px rgba(255,0,20,0.18)",
        }}
      >
        <div
          className="absolute inset-[18%] rounded-full bg-[#ff0033]/12 blur-2xl"
          style={{
            opacity: 0.5 + wave * 0.4,
          }}
        />
        <div className="absolute left-1/2 top-1/2 h-[22%] w-[8%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffcc88]/40 blur-sm" />
      </div>
      <div
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 4px, transparent 4px, transparent 16px)",
        }}
      />
    </div>
  );
};

const FinaleScene = ({ progress }: { progress: number }) => {
  const darkness = clamp(progress * 1.4, 0.15, 0.9);
  const eyeOpen = clamp((progress - 0.3) * 2.2, 0, 1);
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(12,2,3,0.92) 0%, #030104 70%)",
        }}
      />
      <div
        className="absolute inset-0 bg-black transition-opacity duration-1000"
        style={{ opacity: darkness }}
      />
      <div className="absolute left-1/2 top-[48%] h-[44%] w-[38%] -translate-x-1/2 rounded-[48%] bg-gradient-to-b from-[#09020d] via-[#050007] to-black">
        <div className="absolute inset-[12%] rounded-[45%] bg-black shadow-[0_0_80px_rgba(255,0,0,0.2)]" />
        <div
          className="absolute left-1/2 top-[26%] h-[16%] w-[36%] -translate-x-1/2 rounded-full bg-[#260207]/80 blur-lg"
        />
        <div
          className="absolute left-1/2 top-[36%] h-[24%] w-[48%] -translate-x-1/2 origin-center rounded-full bg-[#150108]/90"
          style={{
            transform: `scaleY(${0.1 + eyeOpen * 0.9})`,
            boxShadow: "0 0 90px rgba(255,0,30,0.25)",
          }}
        >
          <div className="absolute left-1/2 top-1/2 h-[68%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff2b4f]" />
          <div className="absolute left-1/2 top-1/2 h-[26%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fffffb]/95 shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
        </div>
      </div>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 48%, rgba(255,0,0,0.4), transparent 55%)",
        }}
      />
    </div>
  );
};

export const SceneIllustration = ({
  sceneKey,
  progress,
}: SceneIllustrationProps) => {
  switch (sceneKey) {
    case "hallway":
      return <HallwayScene progress={progress} />;
    case "doorThreshold":
      return <DoorThresholdScene progress={progress} />;
    case "roomInterior":
      return <RoomInteriorScene progress={progress} />;
    case "mirror":
      return <MirrorScene progress={progress} />;
    case "whispers":
      return <WhisperScene progress={progress} />;
    case "finale":
      return <FinaleScene progress={progress} />;
    default:
      return null;
  }
};

export type { SceneKey };

