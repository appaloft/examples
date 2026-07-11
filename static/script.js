const clock = document.querySelector("#clock");

function updateClock() {
  const now = new Date();
  const time = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  clock.textContent = `Ready to upload · ${time}`;
}

updateClock();
window.setInterval(updateClock, 1000);
