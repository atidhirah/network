class Database {
  static getUsers(page) {
    return fetch(`/users/${page}`)
      .then((response) => response.json())
      .then((result) => {
        return Promise.resolve(result);
      });
  }

  static makePost(email, content) {
    return fetch("/post", {
      method: "POST",
      body: JSON.stringify({
        maker: email,
        content: content,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          return Promise.reject(result.error);
        } else {
          return Promise.resolve(result.message);
        }
      });
  }

  static getPosts(section, page) {
    return fetch(`/section/${section}/${page}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          return Promise.reject(data.error);
        }
        return Promise.resolve(data);
      });
  }

  static getProfile(username, page) {
    return fetch(`/user/${username}/${page}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          return Promise.reject(result.error);
        } else {
          return Promise.resolve(result);
        }
      });
  }

  static followUser(user, targetEmail) {
    return fetch(`/user/${user}/1`, {
      method: "PUT",
      body: JSON.stringify({
        email: targetEmail,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          return Promise.reject(result.error);
        } else {
          return Promise.resolve(result.message);
        }
      });
  }

  static editPost(postId, textContent) {
    return fetch("/post", {
      method: "PUT",
      body: JSON.stringify({
        post_id: postId,
        content: textContent,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          return Promise.reject(result.error);
        } else {
          return Promise.resolve(result.message);
        }
      });
  }

  static likePost(postId, likeStatus) {
    return fetch(`/post`, {
      method: "PUT",
      body: JSON.stringify({
        post_id: postId,
        like_status: likeStatus,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          return Promise.reject(result.error);
        } else {
          return Promise.resolve(result.message);
        }
      });
  }
}

export default Database;
