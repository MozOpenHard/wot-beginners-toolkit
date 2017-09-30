window.addEventListener("load", function() {
  CSSDeviceManager.start();
  document.getElementById("led").addEventListener("change", function(e) {
    console.log(e.target.value);
  });
});
