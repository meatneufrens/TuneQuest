// app.js

const Screens = Array.from(document.querySelectorAll(".Screen"));
const HeaderTitle = document.querySelector("[data-title]");
const ToastBox = document.querySelector("[data-toastbox]");
const BackButton = document.querySelector('[data-action="Back"]');

let IsPremiumUser = false;
const AdChance = 0.75;

const State = {
  CurrentScreen: "Instrument",
  NextScreen: "",
  SelectedInstrument: "Guitar",
  LessonHitStrings: new Set(),
  Coins: 250
};

function GetScreenTitle(ScreenName) {
  const Screen = Screens.find(S => S.dataset.screen === ScreenName);
  if (!Screen) {
    return "TuneQuest";
  }
  return Screen.dataset.title || ScreenName;
}

function UpdateCoinDisplays() {
  document.querySelectorAll("[data-coins]").forEach(Node => {
    Node.textContent = String(State.Coins);
  });
}

function ShowScreen(ScreenName) {
  Screens.forEach(Screen => {
    Screen.classList.toggle("IsActive", Screen.dataset.screen === ScreenName);
  });

  State.CurrentScreen = ScreenName;
  HeaderTitle.textContent = GetScreenTitle(ScreenName);
  UpdateCoinDisplays();
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
  Button.style.transform = IsPressed ? "scale(0.97)" : "";
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

      if (!IsPremiumUser) {
        if (Target === "SkillTree" || Target === "DailyQuests" || Target === "Leaderboard") {
          if (Math.random() > (1.0 - AdChance)) {
            State.NextScreen = Target;
            ShowScreen("ad");
            return;
          }
        }
      }

      ShowScreen(Target);
    });
  });
}

function BindToasts() {
  document.querySelectorAll('[data-action="Toast"]').forEach(Button => {
    Button.addEventListener("click", () => {
      if (Button.dataset.nav) {
        return;
      }
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
          State.Coins += 15;
          UpdateCoinDisplays();
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

    if (Current === "PaymentForPremium") {
      ShowScreen("Premium");
      return;
    }

    ShowScreen("Home");
  });
}

function SetPremiumUser(IsPremium) {
  IsPremiumUser = IsPremium;

  const GoPremiumButtons = document.querySelectorAll(".goPremium");
  GoPremiumButtons.forEach(Button => {
    Button.style.display = IsPremiumUser ? "none" : "inline-block";
  });

  const RemovePremiumButton = document.querySelector("#remove-premium");
  if (RemovePremiumButton) {
    RemovePremiumButton.style.display = IsPremiumUser ? "inline-block" : "none";
  }
}

function BindPremiumToggle() {
  const GetPremiumButton = document.querySelector("#get-premium");
  const ConfirmRemovePremiumButton = document.querySelector("#confirm-remove-premium");

  const RemovePremiumButton = document.querySelector("#remove-premium");
  if (RemovePremiumButton) {
    RemovePremiumButton.style.display = "none";
  }

  GetPremiumButton?.addEventListener("click", () => {
    SetPremiumUser(true);
  });

  ConfirmRemovePremiumButton?.addEventListener("click", () => {
    SetPremiumUser(false);
  });
}

function BindAdClose() {
  document.querySelectorAll(".close-ad").forEach(Button => {
    Button.addEventListener("click", () => {
      ShowScreen(State.NextScreen || "Home");
    });
  });
}

function Boot() {
  ShowScreen(State.CurrentScreen);
  UpdateCoinDisplays();

  BindNav();
  BindToasts();
  BindInstrumentSelect();
  BindSkillTree();
  BindLesson();
  BindBack();
  BindPremiumToggle();
  BindAdClose();
  BindPressFeedback();
}

Boot();
