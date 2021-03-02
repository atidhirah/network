import Database from "../Database.js";

class Post extends HTMLElement {
  set userLogin(email) {
    this._isLogin = email !== null ? true : false;
    this._userEmail = email;
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
      <header class="post__name">
        <p>
          <strong>${this._maker}</strong>
          (${this._email}) &#183; ${this._time}
        </p>
        <div class="post__btn-edit">
          <i class='bx bx-dots-vertical'></i>
          <button>Edit</button>
        </div>
      </header>
      <div class="post__content">
        <p>${this._content}</p>
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
      // Go to profile page when user click on user name
      const userName = this.querySelector(".post__name strong");
      userName.onclick = () => {
        fetch(`/${this._email}/`).then((response) => {
          document.location.href = response.url;
        });
      };

      // Hide edit btn if its not user's post
      const edit = this.querySelector(".post__btn-edit");
      const editIcon = this.querySelector(".post__btn-edit");
      const editBtn = this.querySelector(".post__btn-edit button");
      if (this._email !== this._userEmail) {
        edit.style.display = "none";
      } else {
        let isOnEdit = false;
        editIcon.onclick = () => {
          if (!isOnEdit) {
            editBtn.classList.toggle("show-edit");
          }
        };

        // Change content into textarea when
        // user want to edit the post
        editBtn.onclick = () => {
          isOnEdit = true;
          editBtn.classList.remove("show-edit");
          const content = this.querySelector(".post__content");
          this._content = this._content.replace(/<br\s*\/?>/gi, "\n");
          content.innerHTML = `
            <textarea id="postTextarea">${this._content}</textarea>
            <div class="post__buttons">
              <button class="btn" id="postCancel">Cancel</button>
              <button class="btn" id="postEdit">Edit</button>
            </div>
          `;

          this.querySelector("#postCancel").onclick = () => {
            this._content = this._content.replace(/\n\r?/g, "<br />");
            content.innerHTML = `<p>${this._content}</p>`;
            isOnEdit = false;
          };

          this.querySelector("#postEdit").onclick = () => {
            let textContent = this.querySelector("#postTextarea").value;
            textContent = textContent.replace(/\n\r?/g, "<br />");
            Database.editPost(this._postId, textContent)
              .then((response) => {
                console.log(response);
                this._content = textContent;
                content.innerHTML = `<p>${this._content}</p>`;
                isOnEdit = false;
              })
              .catch((error) => console.log(error));
          };
        };
      }

      // Change like icon depend on likeStatus
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
      // Hide all button when user not login
      const editBtn = this.querySelector(".post__btn-edit");
      const buttons = this.querySelector(".post__buttons");

      editBtn.style.display = "none";
      buttons.innerHTML =
        "<p>Need to login first before interact with this post.</p>";
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
