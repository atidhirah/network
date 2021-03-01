import Database from "./Database.js";
import "./Components/Post.js";

let userStatus;
let userEmail;
let pageCount;
let currentPage;

document.addEventListener("DOMContentLoaded", () => {
  // Check if user login
  const user = document.getElementById("userAction");
  if (user) {
    userStatus = true;
    userEmail = document.getElementById("userActionEmail").innerText;
    Database.getProfile(userEmail, 1);
    // Setup new post button from navigation
    setupNewPost();
  } else {
    userStatus = false;
    userEmail = null;
  }

  // First load content
  setupSection();
});

const setupNewPost = () => {
  const newPost = document.getElementById("newPost");
  const closeBtn = document.getElementById("newPostClose");
  const postBtn = document.getElementById("newPostSubmit");
  const makerForm = document.getElementById("newPostUser");
  const contentForm = document.getElementById("newPostContent");

  document.getElementById("btnNewPost").onclick = () => {
    contentForm.value = "";
    newPost.classList.add("show-newpost");
  };

  newPost.onclick = (event) => {
    if (event.target === newPost || event.target === closeBtn) {
      newPost.classList.remove("show-newpost");
    }
  };

  // Attemp to create new post
  postBtn.onclick = (e) => {
    const maker = makerForm.value;
    let content = contentForm.value;
    content = content.replace(/\n\r?/g, "<br />");
    Database.makePost(maker, content).then(() => {
      // Go to homepage after creating a post
      const url = postBtn.dataset.url;
      document.location.href = url;
    });
    e.preventDefault();
  };
};

const setupSection = () => {
  const contentHeader = document.querySelector(".content header");
  const navId = contentHeader.dataset.section;
  const section = navId;

  if (section !== "profile") {
    if (section == "home") {
      setupHomeNewPost();
    }
    Database.getPosts(section, 1).then((result) => {
      pageCount = result.page_count;
      currentPage = result.page;
      createPostElements(result.data);
      setupPagination(section);
    });
  } else {
    const profileEmail = contentHeader.dataset.email;
    Database.getProfile(profileEmail, 1).then((result) => {
      // Get profile data and show it in UI
      const userData = result.user_data;
      setupProfile(userData);

      // Get all user post data, and show it in UI
      const userPost = result.user_posts;
      pageCount = userPost.page_count;
      currentPage = userPost.page;
      createPostElements(userPost.data);
      setupPagination(section);
    });
  }

  activeNav();
};

// *====================== HOME SECTION ======================*
const setupHomeNewPost = () => {
  const homePostBtn = document.getElementById("homeNewPostSubmit");
  const homePostUser = document.getElementById("homeNewPostUser");
  const homePostContent = document.getElementById("homeNewPostContent");

  homePostBtn.onclick = () => {
    const maker = homePostUser.value;
    let content = homePostContent.value;
    content = content.replace(/\n\r?/g, "<br />");
    Database.makePost(maker, content).then(() => {
      // Go to homepage after creating a post
      const url = homePostBtn.dataset.url;
      document.location.href = url;
    });
    e.preventDefault();
  };
};

// *====================== PROFILE SECTION ======================*
const setupProfile = (profileData) => {
  // Set all data into UI
  document.getElementById("profileName").innerText = profileData.fullname;
  document.getElementById("profileEmail").innerText = profileData.email;
  document.querySelector(
    "#profileDate p"
  ).innerText = `Joined ${profileData.date_joined}`;
  document.getElementById("profileFollowing").innerText =
    profileData.following_count;
  document.getElementById("profileFollowers").innerText =
    profileData.followers_count;

  const followBtn = document.getElementById("followBtn");
  if (profileData.email === userEmail) {
    followBtn.style.display = "none";
  } else {
    let followers = profileData.followers_count;
    let isFollowing;
    if (profileData.followers.includes(userEmail)) {
      followBtn.innerText = "Unfollow";
      isFollowing = true;
    } else {
      followBtn.innerText = "Follow";
      isFollowing = false;
    }

    followBtn.onclick = () => {
      Database.followUser(userEmail, profileData.email)
        .then((result) => {
          console.log(result);
          console.log(profileData);
          if (isFollowing) {
            followers -= 1;
            isFollowing = false;
            followBtn.innerText = "Follow";
          } else {
            followers += 1;
            isFollowing = true;
            followBtn.innerText = "Unfollow";
          }
          document.getElementById("profileFollowers").innerText = followers;
        })
        .catch((error) => console.log(error));
    };
  }
};

// *====================== UTILS ======================*

const getPageData = (section, page) => {
  // Get section post data per page
  Database.getPosts(section, page)
    .then((response) => {
      // Create post element and show it in UI
      createPostElements(response.data);
    })
    .catch((error) => console.log(error));
};

const createPostElements = (arrData) => {
  const index = document.getElementById("postData");

  // Clear previous post data
  index.innerHTML = "";

  // Loop through the data and make post element
  for (let i in arrData) {
    const post = arrData[i];
    const element = document.createElement("network-post");
    element.userLogin = userEmail;
    if (arrData[i].likes.includes(userEmail)) {
      element.likeStatus = true;
    } else {
      element.likeStatus = false;
    }
    element.postData = post;

    // Append post element into post container
    index.appendChild(element);
  }
};

const activeNav = () => {
  // Remove last active nav and pass it into current active
  const navId = document.querySelector(".content header").dataset.section;
  const lastActiveNav = document.querySelector(".active-nav");
  const activeNav = document.getElementById(navId);
  lastActiveNav.classList.remove("active-nav");

  // If user is on another user profile,
  // it will not activate the "Profile" navigation
  if (navId === "profile") {
    const email = document.querySelector(".content header").dataset.email;
    if (email === userEmail) {
      activeNav.classList.add("active-nav");
    }
  } else {
    activeNav.classList.add("active-nav");
  }
};

const setupPagination = (section) => {
  const pagination = document.querySelector("#pagination");
  const paginationP = document.querySelector("#pagination p");
  const paginationButtons = document.querySelectorAll("#pagination button");

  // Dont show the pagination if just 1 page required to hold the data
  if (pageCount === 1) {
    pagination.style.display = "none";
  } else {
    paginationP.innerText = `Page ${currentPage} of ${pageCount}`;

    // Prev and next button to change the page
    paginationButtons.forEach((btn) => {
      if (btn.id === "btnPrev") {
        btn.onclick = () => {
          if (currentPage > 1) {
            currentPage -= 1;
            getPageData(section, currentPage);
            paginationP.innerText = `Page ${currentPage} of ${pageCount}`;
          }
        };
      } else {
        btn.onclick = () => {
          if (currentPage < pageCount) {
            currentPage += 1;
            getPageData(section, currentPage);
            paginationP.innerText = `Page ${currentPage} of ${pageCount}`;
          }
        };
      }
    });
  }
};
