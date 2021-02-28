document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".field").forEach((field) => {
    const label = field.querySelector("label");
    const inp = field.querySelector("input");

    inp.addEventListener("focusin", () => {
      label.classList.add("focused-field");
    });

    inp.addEventListener("focusout", () => {
      if (inp.value === "") {
        label.classList.remove("focused-field");
      }
    });
  });
});
