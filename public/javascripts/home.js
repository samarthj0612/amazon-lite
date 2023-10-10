document.querySelectorAll("#addtocart").forEach(function (btn) {
  btn.addEventListener("click", function (dets) {
    axios.get(`/addtocart/${dets.target.classList[0]}`).then(function (user) {
      document.querySelector("#cart span").textContent = user.data.cart;
      dets.target.textContent = "Added";
    });
  });
});
