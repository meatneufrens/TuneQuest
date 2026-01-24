// app.js

const Screens = Array.from(document.querySelectorAll(".Screen"));
const HeaderTitle = document.querySelector("[data-title]");
const ToastBox = document.querySelector("[data-toastbox]");
const BackButton = document.querySelector('[data-action="Back"]');

const State = {
  CurrentScreen: "Instrument",
  SelectedInstrument: "Guitar",
  LessonHitStrings: new Set()
};

function GetScreenTitle(ScreenName) {
  const Screen = Screens.find(S => S.dataset.screen === ScreenName);
  if (!Screen) {
    return "TuneQuest";
  }

  const Title = Screen.dataset.title;
  return Title || ScreenName;
}

function ShowScreen(ScreenName) {
  Screens.forEach(Screen => {
    Screen.classList.toggle("IsActive", Screen.dataset.screen === ScreenName);
  });

  State.CurrentScreen = ScreenName;
  HeaderTitle.textContent = GetScreenTitle(ScreenName);
}

let ToastTimerHandle = null;

function ShowToast(Message) {
  if (!ToastBox) {
    return;
  }

  if (ToastTimerHandle) {
    window.clearTimeout(ToastTimerHandle);
    ToastTimerHandle = null;
  }

  ToastBox.textContent = Message;
  ToastBox.classList.add("IsVisible");

  ToastTimerHandle = window.setTimeout(() => {
    ToastBox.classList.remove("IsVisible");
  }, 1400);
}

function SetPressedStyle(Button, IsPressed) {
  if (IsPressed) {
    Button.style.transform = "scale(0.97)";
    return;
  }
  Button.style.transform = "";
}

function BindPressFeedback() {
  document.querySelectorAll("button").forEach(Button => {
    Button.addEventListener("mousedown", () => SetPressedStyle(Button, true));
    Button.addEventListener("mouseup", () => SetPressedStyle(Button, false));
    Button.addEventListener("mouseleave", () => SetPressedStyle(Button, false));
    Button.addEventListener("touchstart", () => SetPressedStyle(Button, true), { passive: true });
    Button.addEventListener("touchend", () => SetPressedStyle(Button, false));
  });
}

function BindNav() {
  document.querySelectorAll("[data-nav]").forEach(Button => {
    Button.addEventListener("click", () => {
      const Target = Button.dataset.nav;
      if (!Target) {
        return;
      }

      if (Target === "Home" && State.CurrentScreen === "Instrument") {
        ShowToast("Choose an instrument first !");
        return;
      }

      ShowScreen(Target);
    });
  });
}

function BindToasts() {
  document.querySelectorAll('[data-action="Toast"]').forEach(Button => {
    Button.addEventListener("click", () => {
      const Message = Button.dataset.toast || "Showcase only !";
      ShowToast(Message);
    });
  });
}

function BindInstrumentSelect() {
  const InstrumentButtons = Array.from(document.querySelectorAll("[data-instrument]"));
  const ContinueButton = document.querySelector('[data-action="InstrumentContinue"]');

  InstrumentButtons.forEach(Button => {
    Button.addEventListener("click", () => {
      const Instrument = Button.dataset.instrument;
      if (!Instrument) {
        return;
      }

      if (Instrument !== "Guitar") {
        State.SelectedInstrument = Instrument;
        InstrumentButtons.forEach(B => B.classList.remove("MainButton--active"));
        Button.classList.add("MainButton--active");
        ShowToast("Only Guitar is enabled in this showcase !");
        return;
      }

      State.SelectedInstrument = "Guitar";
      InstrumentButtons.forEach(B => B.classList.remove("MainButton--active"));
      Button.classList.add("MainButton--active");
      ShowToast("Guitar selected !");
    });
  });

  ContinueButton?.addEventListener("click", () => {
    if (State.SelectedInstrument !== "Guitar") {
      ShowToast("Please select Guitar for this showcase !");
      return;
    }
    ShowScreen("Login");
  });
}

function BindSkillTree() {
  document.querySelectorAll('[data-action="OpenLesson"]').forEach(Node => {
    Node.addEventListener("click", () => {
      const Lesson = Node.dataset.lesson;
      if (!Lesson) {
        return;
      }

      ShowScreen(Lesson);
      ResetLesson();
    });
  });
}

function GetLessonProgressFill() {
  return document.querySelector("[data-progress]");
}

function SetLessonProgress(Percent) {
  const Fill = GetLessonProgressFill();
  if (!Fill) {
    return;
  }
  const Clamped = Math.max(0, Math.min(100, Percent));
  Fill.style.width = `${Clamped}%`;
}

function ResetLesson() {
  State.LessonHitStrings.clear();
  document.querySelectorAll(".StringButton").forEach(Button => {
    Button.classList.remove("IsHit");
  });
  SetLessonProgress(0);
}

function BindLesson() {
  const StringButtons = Array.from(document.querySelectorAll(".StringButton"));
  const ResetButton = document.querySelector('[data-action="ResetLesson"]');

  StringButtons.forEach(Button => {
    Button.addEventListener("click", () => {
      const StringId = Button.dataset.string;
      if (!StringId) {
        return;
      }

      if (!State.LessonHitStrings.has(StringId)) {
        State.LessonHitStrings.add(StringId);
        Button.classList.add("IsHit");

        const Progress = (State.LessonHitStrings.size / 6) * 100;
        SetLessonProgress(Progress);

        if (State.LessonHitStrings.size === 6) {
          ShowToast("Nice. Lesson complete (showcase)!");
        } else {
          ShowToast("Good hit.");
        }
      } else {
        ShowToast("Already tapped.");
      }
    });
  });

  ResetButton?.addEventListener("click", () => {
    ResetLesson();
    ShowToast("Reset.");
  });
}

function BindBack() {
  BackButton?.addEventListener("click", () => {
    const Current = State.CurrentScreen;

    if (Current === "Instrument") {
      ShowToast("Select Guitar to continue.");
      return;
    }

    if (Current === "Login") {
      ShowScreen("Instrument");
      return;
    }

    if (Current === "Home") {
      ShowToast("This is a showcase.");
      return;
    }

    if (Current === "LessonGuitar01") {
      ShowScreen("SkillTree");
      return;
    }

    ShowScreen("Home");
  });
}

function Boot() {
  ShowScreen(State.CurrentScreen);
  BindNav();
  BindToasts();
  BindInstrumentSelect();
  BindSkillTree();
  BindLesson();
  BindBack();
  BindPressFeedback();
}

Boot();