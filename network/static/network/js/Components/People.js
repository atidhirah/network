import Database from "../Database.js";

class NetworkUser extends HTMLElement {
  set loginUser(email) {
    this._loginUser = email;
  }

  set userData(data) {
    this._id = data.id;
    this._fullname = data.fullname;
    this._email = data.email;

    if (data.following.includes(this._loginUser)) {
      this._isFollowing = true;
    } else {
      this._isFollowing = false;
    }
    console.log(this._isFollowing);

    this.render();
  }

  render() {
    this.innerHTML = `
    <div class="people__container">
      <div class="people__img"></div>
      <div class="people__data">
        <p class="people__name text-name">${this._fullname}</p>
        <p class="text-email">${this._email}</p>
      </div>
      <button class="people__follow"></button>
    </div>      
    `;

    // Go to profile page when click on user name
    const username = this.querySelector(".people__name");
    username.onclick = () => {
      fetch(`/${this._email}/`).then((response) => {
        document.location.href = response.url;
      });
    };

    // Follow button event listener
    const followBtn = this.querySelector(".people__follow");
    if (!this._isFollowing) {
      followBtn.innerHTML = "Follow";
    } else {
      followBtn.innerHTML = "Unfollow";
    }
    followBtn.onclick = () => {
      Database.followUser(this._loginUser, this._email).then((result) => {
        console.log(result);
        this._isFollowing = !this._isFollowing;

        if (!this._isFollowing) {
          followBtn.innerHTML = "Follow";
        } else {
          followBtn.innerHTML = "Unfollow";
        }
      });
    };
  }
}

customElements.define("network-user", NetworkUser);
