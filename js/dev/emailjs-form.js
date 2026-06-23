const EMAILJS_SERVICE_ID = "service_oyg0xyb";
const EMAILJS_TEMPLATE_ID = "template_g9mbqxm";
const EMAILJS_PUBLIC_KEY = "CaWIccFNvSrFYhuUf";
window.addEventListener("load", function() {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  const form = document.querySelector('[data-fls-form="custom"]');
  if (!form) return;
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const get = (name) => {
      const el = form.querySelector(`[name="${name}"]`);
      return el ? el.value : "";
    };
    const getChecked = (name) => {
      const el = form.querySelector(`input[name="${name}"]:checked`);
      return el ? el.value : "";
    };
    const getAllChecked = (name) =>
      [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value).join(", ");

    const templateParams = {
      location: getChecked("form[location]"),
      treatment: getChecked("form[treatment]"),
      priority: getAllChecked("form[priority][]"),
      date: getChecked("form[date]"),
      budget: getChecked("form[budget]"),
      name: get("form[name]"),
      phone: get("form[phone]"),
      email: get("form[email]")
    };
    form.classList.add("--sending");
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams).then(() => {
      form.classList.remove("--sending");
      localStorage.removeItem("clinicselect_form");
      sessionStorage.setItem("formSubmitted", "1");
      window.location.href = "./danke.html";
    }).catch((error) => {
      form.classList.remove("--sending");
      console.error("EmailJS error:", error);
      sessionStorage.setItem("formError", "1");
      window.location.href = "./fehler.html";
    });
  });
});
