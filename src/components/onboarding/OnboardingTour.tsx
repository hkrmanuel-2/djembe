import { useState, useEffect } from "react";
import Joyride, {
  Step,
  CallBackProps,
  STATUS,
  ACTIONS,
  TooltipRenderProps,
} from "react-joyride";

interface OnboardingTourProps {
  userType: "student" | "teacher";
  onComplete: () => void;
}

/* ──────────────────────────────────────────────
   Djembe mascot sprite helper
   The full-body sprite sheet is a 3×3 grid (1024×1024).
   Each cell ≈ 341×341 px.

   Grid positions (row, col):
     0,0 = waving   0,1 = surprised  0,2 = worried
     1,0 = dancing   1,1 = happy      1,2 = pointing
     2,0 = confused  2,1 = angry      2,2 = sleeping
   ────────────────────────────────────────────── */
type MascotPose =
  | "waving"
  | "surprised"
  | "worried"
  | "dancing"
  | "happy"
  | "pointing"
  | "confused"
  | "angry"
  | "sleeping";

const POSE_POSITIONS: Record<MascotPose, { col: number; row: number }> = {
  waving: { col: 0, row: 0 },
  surprised: { col: 1, row: 0 },
  worried: { col: 2, row: 0 },
  dancing: { col: 0, row: 1 },
  happy: { col: 1, row: 1 },
  pointing: { col: 2, row: 1 },
  confused: { col: 0, row: 2 },
  angry: { col: 1, row: 2 },
  sleeping: { col: 2, row: 2 },
};

function DjembeMascot({
  pose,
  size = 100,
}: {
  pose: MascotPose;
  size?: number;
}) {
  const { col, row } = POSE_POSITIONS[pose];
  return (
    <div
      aria-label={`Djembe mascot ${pose}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "url('/ui assets/djemb_fullbody.png')",
        backgroundSize: `${size * 3}px ${size * 3}px`,
        backgroundPosition: `-${col * size}px -${row * size}px`,
        backgroundRepeat: "no-repeat",
        flexShrink: 0,
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
      }}
    />
  );
}

/* ──────────────────────────────────────────────
   Custom Tooltip – big, readable, kid-friendly
   ────────────────────────────────────────────── */
function CustomTooltip({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
  size: totalSteps,
  isLastStep,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      style={{
        backgroundColor: "#3E2468",
        borderRadius: 20,
        padding: 0,
        maxWidth: 420,
        width: "90vw",
        boxShadow: "0 12px 40px rgba(62, 36, 104, 0.5)",
        overflow: "hidden",
        fontFamily: "'Fredoka', sans-serif",
      }}
    >
      {/* Content area */}
      <div style={{ padding: "28px 24px 16px" }}>{step.content}</div>

      {/* Progress dots + buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px 20px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i === index ? "#D97746" : "rgba(255,255,255,0.2)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {index === 0 ? (
            <button
              {...skipProps}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: 14,
                cursor: "pointer",
                padding: "6px 12px",
                fontFamily: "'Fredoka', sans-serif",
              }}
            >
              Skip
            </button>
          ) : (
            <button
              {...backProps}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.7)",
                fontSize: 15,
                cursor: "pointer",
                padding: "6px 14px",
                fontFamily: "'Fredoka', sans-serif",
              }}
            >
              Back
            </button>
          )}
          {continuous && (
            <button
              {...primaryProps}
              style={{
                backgroundColor: "#D97746",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "10px 24px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Fredoka', sans-serif",
                boxShadow: "0 4px 12px rgba(217, 119, 70, 0.4)",
              }}
            >
              {isLastStep ? "Let's Go!" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Step content builders
   ────────────────────────────────────────────── */

/** Welcome / goodbye full-screen step */
function WelcomeSlide({
  pose,
  title,
  message,
  subtext,
}: {
  pose: MascotPose;
  title: string;
  message: string;
  subtext?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "8px 0",
      }}
    >
      <DjembeMascot pose={pose} size={120} />
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#fff",
          marginTop: 16,
          marginBottom: 8,
          fontFamily: "'Fredoka', sans-serif",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.5,
          maxWidth: 320,
        }}
      >
        {message}
      </p>
      {subtext && (
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            marginTop: 8,
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}

/** Regular tooltip step with mascot on the left */
function GuideSlide({
  pose,
  title,
  message,
}: {
  pose: MascotPose;
  title: string;
  message: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        textAlign: "left",
      }}
    >
      <DjembeMascot pose={pose} size={80} />
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 4,
            fontFamily: "'Fredoka', sans-serif",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────── */
export default function OnboardingTour({
  userType,
  onComplete,
}: OnboardingTourProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRun(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // ─── Student Tour ────────────────────────────────────
  const studentSteps: Step[] = [
    // 1. Welcome
    {
      target: "body",
      content: (
        <WelcomeSlide
          pose="waving"
          title="Hey! I'm Djembe!"
          message="I'm a magical drum and I'm going to show you around! Ready for a quick tour?"
          subtext="This only takes a minute!"
        />
      ),
      placement: "center",
      disableBeacon: true,
    },
    // 2. Home
    {
      target: '[href="/home"]',
      content: (
        <GuideSlide
          pose="happy"
          title="Home"
          message="This is your home base! Come here to see what's new and jump into your favourite stuff."
        />
      ),
      placement: "top",
    },
    // 3. Music Studio
    {
      target: '[href="/daw"]',
      content: (
        <GuideSlide
          pose="dancing"
          title="Music Studio"
          message="This is where you make music! Drag loops onto the timeline, hit play, and hear your song come to life!"
        />
      ),
      placement: "top",
    },
    // 4. Music Studio – deeper: Loop Library
    {
      target: "body",
      content: (
        <GuideSlide
          pose="pointing"
          title="Pick Your Sounds"
          message="Inside the Music Studio, you'll find a big library of loops — drums, melodies, and more. Just drag the ones you like onto the tracks!"
        />
      ),
      placement: "center",
    },
    // 5. Music Studio – deeper: Transport / Play
    {
      target: "body",
      content: (
        <GuideSlide
          pose="happy"
          title="Press Play!"
          message="When your song is ready, hit the play button to hear it! You can change the speed and save your song to listen later."
        />
      ),
      placement: "center",
    },
    // 6. Challenges
    {
      target: '[href="/assignments"]',
      content: (
        <GuideSlide
          pose="pointing"
          title="Challenges"
          message="Your teacher puts fun music challenges here. Finish them and turn in your work — you might even earn bonus points!"
        />
      ),
      placement: "top",
    },
    // 7. Turning in work
    {
      target: "body",
      content: (
        <GuideSlide
          pose="happy"
          title="Turn In Your Work"
          message="When you're done with a challenge, just tap it, upload your file, and hit 'Turn In'. Easy peasy!"
        />
      ),
      placement: "center",
    },
    // 8. Teacher's Comments
    {
      target: "body",
      content: (
        <GuideSlide
          pose="surprised"
          title="Teacher's Comments"
          message="After your teacher looks at your work, you'll see their comments and points right here. Check back often!"
        />
      ),
      placement: "center",
    },
    // 9. My Journey
    {
      target: '[href="/progress"]',
      content: (
        <GuideSlide
          pose="dancing"
          title="My Journey"
          message="See how far you've come! Watch your level go up, collect cool badges, and keep your streak going!"
        />
      ),
      placement: "top",
    },
    // 10. Badges & Streaks
    {
      target: "body",
      content: (
        <GuideSlide
          pose="waving"
          title="Earn Badges!"
          message="The more you play and create, the more badges you unlock! Try to collect them all and keep your 'Days in a Row' streak going!"
        />
      ),
      placement: "center",
    },
    // 11. 3D Worlds
    {
      target: '[href="/world1"]',
      content: (
        <GuideSlide
          pose="surprised"
          title="3D Worlds"
          message="Step inside amazing 3D places! Walk around a campfire or explore a big concert stage with real instruments!"
        />
      ),
      placement: "top",
    },
    // 12. 3D Worlds – interacting
    {
      target: "body",
      content: (
        <GuideSlide
          pose="dancing"
          title="Click to Play!"
          message="In the 3D worlds you can click on characters to make them play music! Spin around the scene by dragging with your finger or mouse."
        />
      ),
      placement: "center",
    },
    // 13. Tutorials
    {
      target: '[href="/tutorials"]',
      content: (
        <GuideSlide
          pose="pointing"
          title="Tutorials"
          message="Watch fun videos that teach you new tricks. Learn how to make better beats and discover cool features!"
        />
      ),
      placement: "top",
    },
    // 14. Settings
    {
      target: '[href="/settings"]',
      content: (
        <GuideSlide
          pose="happy"
          title="Settings"
          message="Change your name, pick a theme, or restart this tour anytime. It's all in here!"
        />
      ),
      placement: "top",
    },
    // 15. Goodbye
    {
      target: "body",
      content: (
        <WelcomeSlide
          pose="dancing"
          title="You're ready to rock!"
          message="That's everything! Now go make some awesome music and have fun!"
          subtext="Psst... you can redo this tour anytime from Settings!"
        />
      ),
      placement: "center",
    },
  ];

  // ─── Teacher Tour ────────────────────────────────────
  const teacherSteps: Step[] = [
    // 1. Welcome
    {
      target: "body",
      content: (
        <WelcomeSlide
          pose="waving"
          title="Welcome, Teacher!"
          message="I'm Djembe! Let me show you how to set up your class and guide your students' musical journey."
        />
      ),
      placement: "center",
      disableBeacon: true,
    },
    // 2. Student Dashboard
    {
      target: '[href="/students"]',
      content: (
        <GuideSlide
          pose="pointing"
          title="Your Students"
          message="See all your students in one place — their levels, points, songs, and streaks. Spot who's doing great and who might need help!"
        />
      ),
      placement: "top",
    },
    // 3. Challenges
    {
      target: '[href="/teacher/assignments"]',
      content: (
        <GuideSlide
          pose="happy"
          title="Create Challenges"
          message="Set up fun music challenges for your class! Choose a due date, pick which class it's for, and your students will see it right away."
        />
      ),
      placement: "top",
    },
    // 4. Challenge types
    {
      target: "body",
      content: (
        <GuideSlide
          pose="pointing"
          title="Two Types of Challenges"
          message="You can create file upload challenges (students submit audio files) or Music Project challenges (students create directly in the Music Studio)."
        />
      ),
      placement: "center",
    },
    // 5. Student Work
    {
      target: '[href="/teacher/submissions"]',
      content: (
        <GuideSlide
          pose="happy"
          title="Student Work"
          message="When students turn in their work, it shows up here. Listen to their songs, leave comments, and give them points!"
        />
      ),
      placement: "top",
    },
    // 6. Student Insights
    {
      target: '[href="/teacher/analytics"]',
      content: (
        <GuideSlide
          pose="surprised"
          title="Student Insights"
          message="Quickly see which students might need extra help and celebrate the ones who are on a roll!"
        />
      ),
      placement: "top",
    },
    // 7. Student Projects
    {
      target: '[href="/teacher/projects"]',
      content: (
        <GuideSlide
          pose="dancing"
          title="Student Projects"
          message="Browse all the songs your students made in the Music Studio. Preview their tracks and leave comments to encourage them!"
        />
      ),
      placement: "top",
    },
    // 8. 3D Worlds
    {
      target: '[href="/teacher/worlds"]',
      content: (
        <GuideSlide
          pose="surprised"
          title="3D Worlds"
          message="Explore the same 3D worlds your students use — a campfire scene and a concert stage with interactive instruments!"
        />
      ),
      placement: "top",
    },
    // 9. Tutorials
    {
      target: '[href="/tutorials"]',
      content: (
        <GuideSlide
          pose="pointing"
          title="Tutorials"
          message="Watch platform guides or upload your own tutorial videos for students. Great for flipped classroom activities!"
        />
      ),
      placement: "top",
    },
    // 10. Settings
    {
      target: '[href="/settings"]',
      content: (
        <GuideSlide
          pose="happy"
          title="Settings"
          message="Update your profile, manage preferences, or restart this tour anytime you need a refresher."
        />
      ),
      placement: "top",
    },
    // 11. Goodbye
    {
      target: "body",
      content: (
        <WelcomeSlide
          pose="dancing"
          title="You're all set!"
          message="You've got everything you need to inspire your students. Let's make some music!"
          subtext="You can redo this tour anytime from Settings."
        />
      ),
      placement: "center",
    },
  ];

  const steps = userType === "student" ? studentSteps : teacherSteps;

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status as any)) {
      setRun(false);
      onComplete();
    }

    if (action === ACTIONS.CLOSE) {
      setRun(false);
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      scrollToFirstStep
      disableScrolling={false}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: "#3E2468",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Let's Go!",
        next: "Next",
        skip: "Skip",
      }}
    />
  );
}
