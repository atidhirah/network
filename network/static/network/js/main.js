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
    // Setup new post button from navigation
    setupNewPost();
  } else {
    userStatus = false;
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
    console.log(maker);
    let content = contentForm.value;
    content = content.replace(/\n\r?/g, "<br />");
    console.log(maker);
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
  activeNav(navId);

  let section = "";
  switch (navId) {
    case "navIndex":
      section = "home";
      setupHomeNewPost();
      break;
    case "navExplore":
      section = "explore";
      break;
    case "navProfile":
      section = "profile";
      break;
  }

  Database.getPosts(section, 1).then((result) => {
    pageCount = result.page_count;
    currentPage = result.page;
    createPostElements(result.data);
    setupPagination(section);
  });
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
    element.userLogin = userStatus;
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

const activeNav = (navId) => {
  const lastActiveNav = document.querySelector(".active-nav");
  const activeNav = document.getElementById(navId);

  // Remove last active nav and pass it into current active
  lastActiveNav.classList.remove("active-nav");
  activeNav.classList.add("active-nav");
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
