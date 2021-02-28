import Database from "../Database.js";

class Post extends HTMLElement {
  set userLogin(status) {
    this._isLogin = status ? true : false;
  }

  set likeStatus(status) {
    this._likeStatus = status;
  }

  set postData(data) {
    this._postId = data.id;
    this._maker = data.maker;
    this._email = data.maker_email;
    this._content = data.content;
    this._likes = data.likes.length;
    this._time = data.created_on;

    this.render();
  }

  render() {
    this.innerHTML = `
    <div class="post__container">
      <header>
        <p><strong>${this._maker}</strong> (${this._email}) &#183; ${this._time}</p>
      </header>
      <div>
        <p class="post__content">${this._content}</p>
      </div>
      <div class="post__buttons">
        <button class="post__comment">
          <i class='bx bx-comment'></i>
        </button>
        <button class="post__share">
          <i class='bx bx-share'></i>
        </button>
        <button class="post__like">
          
          <i class='bx bx-heart'></i><span>${this._likes}</span>
        </button>
      </div>
    </div>
    `;

    if (this._isLogin) {
      const icon = this.querySelector(".post__like i");
      if (this._likeStatus) {
        icon.classList.remove("bx-heart");
        icon.classList.add("bxs-heart");
      } else {
        icon.classList.remove("bxs-heart");
        icon.classList.add("bx-heart");
      }
      const btnLiked = this.querySelector(".post__like");
      btnLiked.onclick = () => this.likeBtnEvent();
    } else {
      const buttons = this.querySelector(".post__buttons");
      buttons.innerHTML =
        "<p>You need to login first before interact to this post.</p>";
    }
  }

  likeBtnEvent() {
    if (this._likeStatus) {
      // Unlike the post
      this._likes -= 1;
      this._likeStatus = false;
    } else {
      // Like the post
      this._likes += 1;
      this._likeStatus = true;
    }

    Database.likePost(this._postId, this._likeStatus).then(() => {
      // Update like count
      this.querySelector(".post__like span").innerText = this._likes;
      // Update like icon
      const icon = this.querySelector(".post__like i");
      if (this._likeStatus) {
        icon.classList.remove("bx-heart");
        icon.classList.add("bxs-heart");
      } else {
        icon.classList.remove("bxs-heart");
        icon.classList.add("bx-heart");
      }
    });
  }
}

customElements.define("network-post", Post);
