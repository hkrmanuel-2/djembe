import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS, ACTIONS } from "react-joyride";

interface OnboardingTourProps {
  userType: "student" | "teacher";
  onComplete: () => void;
}

export default function OnboardingTour({
  userType,
  onComplete,
}: OnboardingTourProps) {
  const [run, setRun] = useState(false);

  // Start tour after a short delay to ensure DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setRun(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Define tour steps based on user type
  const studentSteps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">Welcome to Djembe!</h2>
          <p>Let's take a quick tour to get you started with music creation.</p>
        </div>
      ),
      placement: "center",
    },
    {
      target: '[href="/home"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Navigation Bar</h3>
          <p>
            Use the navigation bar at the bottom to move between different
            sections of Djembe.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[href="/daw"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">DAW-Lite</h3>
          <p>
            Create your own music using our Digital Audio Workstation. Drag
            loops, arrange beats, and export your creations!
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[href="/assignments"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Assignments</h3>
          <p>
            View assignments from your teacher, submit your work, and track your
            grades and feedback.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[href="/progress"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Progress</h3>
          <p>
            Track your XP, level up, earn badges, and maintain your learning
            streak!
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[href="/world1"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">3D Worlds</h3>
          <p>
            Explore immersive 3D environments with interactive music experiences.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[href="/tutorials"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Tutorials</h3>
          <p>
            Watch video tutorials anytime to learn new skills and master
            Djembe's features.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">You're All Set!</h2>
          <p className="mb-3">
            You're ready to start creating music. Happy composing!
          </p>
          <p className="text-sm text-white/60">
            You can restart this tour anytime from Settings.
          </p>
        </div>
      ),
      placement: "center",
    },
  ];

  const teacherSteps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">Welcome, Teacher!</h2>
          <p>
            Let's explore the tools available to help you manage your students
            and classes.
          </p>
        </div>
      ),
      placement: "center",
    },
    {
      target: '[href="/students"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Student Dashboard</h3>
          <p>
            Monitor student progress, view statistics, and track individual
            student performance.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[href="/teacher/assignments"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Create Assignments</h3>
          <p>
            Create and distribute assignments to your students. Set due dates
            and target specific classes.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[href="/teacher/submissions"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Review Submissions</h3>
          <p>
            View student submissions, download files, provide feedback, and
            assign grades.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[href="/teacher/analytics"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p>
            Identify struggling students, track class progress, and use data to
            inform your teaching.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[href="/teacher/projects"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Student Projects</h3>
          <p>View and review all student projects created in the DAW-Lite.</p>
        </div>
      ),
      placement: "top",
    },
    {
      target: '[href="/tutorials"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Tutorials</h3>
          <p>
            Access platform tutorials and upload your own custom video content
            for students.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">Ready to Inspire!</h2>
          <p className="mb-3">
            You have all the tools you need to guide your students' musical
            journey.
          </p>
          <p className="text-sm text-white/60">
            You can restart this tour anytime from Settings.
          </p>
        </div>
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

    // Don't close on ESC key (handled by skip button)
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
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrolling={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#D97746",
          zIndex: 10000,
          arrowColor: "#3E2468",
          backgroundColor: "#3E2468",
          textColor: "#ffffff",
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "#D97746",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 14,
          fontWeight: 600,
        },
        buttonBack: {
          color: "#ffffff",
          marginRight: 10,
        },
        buttonSkip: {
          color: "#ffffff80",
        },
        buttonClose: {
          display: "none",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  );
}
