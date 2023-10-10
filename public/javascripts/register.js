document.querySelector("#email").addEventListener("input", function () {
  var that = this;
  if (this.value.trim().length == 0) {
    that.style.border = "2px solid #E8EBEE";
  } else {
    axios.get(`/checkexistence/${that.value}`).then(function (data) {
      if (data.data.user) {
        that.style.border = "2px solid red";
      } else {
        that.style.border = "3px solid green";
      }
    });
  }
});
