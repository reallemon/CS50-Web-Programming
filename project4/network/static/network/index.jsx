// CSRF token for use in Fetch requests
// Import by including fetch header of: 'X-CSRFToken': csrftoken
var csrftoken = getCookie("csrftoken");

// CSRF token for use as component inside forms
// Include at top of form with <CSRFToken />
const CSRFToken = () => {
  return <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken} />;
};
class App extends React.Component {
  render() {
    return (
      <div>
        <Post />
      </div>
    );
  }
}

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      message: "",
      helpText: "",
      messageClass: "",
      placeholder: "",
      posts: [],
      currentPage: 1,
      postsPerPage: 10,
      userView: -1,
      userViewName: null,
      userViewUser: null,
    };

    // Load existing posts
    this.getNewPosts = this.getNewPosts.bind(this);
    this.getNewPosts();
  }

  render() {
    return (
      <div>
        {this.profilePage()}
        {this.newPost()}
        <div className="row">
          <div className="col-sm-12">{this.pagination()}</div>
        </div>
      </div>
    );
  }

  profilePage() {
    if (this.state.userView != -1 && this.state.userViewName) {
      if (!this.state.userViewUser) {
        this.getProfilePage;
        return <div>Loading...</div>;
      } else {
        return (
          <div>
            <div className="row">
              <div className="col-sm-12">
                <h1>{this.state.userViewName}</h1>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <small>
                  {this.state.userViewUser.followers.length} followers
                </small>
              </div>
              <div className="col-sm-6">
                <small>
                  Following {this.state.userViewUser.following} people.
                </small>
              </div>
            </div>
          </div>
        );
      }
    } else if (this.state.userView !== -1) {
      return (
        <div>
          <div className="row">
            <div className="col-sm-12">
              <h1>Sorry, that user doesn't exist.</h1>
            </div>
          </div>
        </div>
      );
    }
  }

  async getProfilePage() {
    const response = await fetch(`users/${this.state.userView}`);
    const user = await response.json();
    this.setState({ userViewUser: user });
  }

  newPost() {
    if (
      this.state.userView === -1 ||
      this.state.userView === parseInt(window.django.user.id)
    ) {
      return (
        <div className="row">
          <div className="col-sm-12">
            <form onSubmit={this.submitHandler}>
              <div className="form-group pt-3">
                <div className={this.state.messageClass} role="alert">
                  {this.state.message}
                </div>
                <textarea
                  className="form-control rounded-pill"
                  value={this.state.text}
                  onChange={this.updateText}
                  onKeyPress={this.inputKeyPress}
                  aria-describedby="newPostHelp"
                  placeholder="New post..."
                />
                <small id="newPostHelp" className="form-text text-muted">
                  {this.state.helpText}
                </small>
              </div>
            </form>
          </div>
        </div>
      );
    }
  }

  pagination() {
    const indexOfLastPost = this.state.currentPage * this.state.postsPerPage;
    const indexOfFirstPost = indexOfLastPost - this.state.postsPerPage;

    let userPosts = [];
    if (this.state.userView === -1) {
      userPosts = this.state.posts;
    } else {
      userPosts = this.state.posts.filter(
        (post) => post.user.id == this.state.userView
      );
    }

    const currentPosts = userPosts.slice(indexOfFirstPost, indexOfLastPost);
    const pageNumbers = [];
    for (
      let i = 1;
      i <= Math.ceil(userPosts.length / this.state.postsPerPage);
      i++
    ) {
      pageNumbers.push(i);
    }

    return (
      <div>
        <ul className="list-group">
          {currentPosts.map((post) => (
            <li
              key={post.id}
              className="list-group-item mb-2 border rounded-pill fade-in"
            >
              <div className="ml-5">
                <h2>
                  <a
                    href="#!"
                    onClick={() =>
                      this.changeUserView(post.user.id, post.user.username)
                    }
                  >
                    {post.user.username}
                  </a>
                </h2>
                {this.postText(post)}
                <p>
                  <small className="text-muted">{post.timestamp}</small>
                </p>
                <a href="#!" onClick={() => this.likePost(post.id)}>
                  {this.likeOrNot(post.likes)} {post.likes.length}
                </a>
              </div>
            </li>
          ))}
        </ul>
        <nav>
          <ul className="pagination">
            {this.isFirstPage()}
            {pageNumbers.map((number) => (
              <li className="page-item" key={number}>
                <a
                  href="#!"
                  className="page-link"
                  onClick={() =>
                    this.setState({
                      currentPage: number,
                    })
                  }
                >
                  {number}
                </a>
              </li>
            ))}
            {this.isLastPage(userPosts)}
          </ul>
        </nav>
      </div>
    );
  }

  changeUserView(id, name) {
    this.setState({
      userView: id,
      userViewName: name,
    });
  }

  postText(post) {
    if (post.editable) {
      return (
        <div>
          <a href="#!" onClick={() => this.saveEdit(post.id)}>
            Save
          </a>
          <form onSubmit={this.submitHandler}>
            <textarea
              className="form-control"
              onChange={(e) => this.editComment(e, post.id)}
              value={post.text}
            ></textarea>
          </form>
        </div>
      );
    }
    return (
      <div>
        <a href="#!" onClick={() => this.changeEdit(post.id)}>
          {this.canEdit(post.user.id)}
        </a>
        <p className="py-1">{post.text}</p>
      </div>
    );
  }

  saveEdit(postId) {
    let post = this.state.posts.find((obj) => obj["id"] === postId);
    if (post.text != "\n" && post.text.length > 0) {
      fetch(`posts/${postId}`, {
        method: "PUT",
        headers: {
          "X-CSRFToken": window.django.csrf,
        },
        body: JSON.stringify({
          text: post.text,
        }),
      });
      this.changeEdit(postId);
      this.getNewPosts();
    }
  }

  editComment(event, postId) {
    if (event.target.value != "\n") {
      let postIndex = this.state.posts.findIndex((obj) => obj["id"] === postId);
      let posts = [...this.state.posts];
      let post = { ...posts[postIndex] };
      post.text = event.target.value;
      posts[postIndex] = post;
      this.setState({ posts });
    }
  }

  changeEdit(postId) {
    let postIndex = this.state.posts.findIndex((obj) => obj["id"] === postId);
    let posts = [...this.state.posts];
    let post = { ...posts[postIndex] };
    post.editable = !post.editable;
    posts[postIndex] = post;
    this.setState({ posts });
  }

  canEdit(postUserId) {
    if (postUserId === parseInt(window.django.user.id)) {
      return <small>Edit</small>;
    }
  }

  likePost(id) {
    fetch(`posts/${id}`, {
      method: "PUT",
      headers: {
        "X-CSRFToken": window.django.csrf,
      },
      body: JSON.stringify({
        liked: "toggle",
      }),
    });
    this.getNewPosts();
  }

  isFirstPage() {
    if (this.state.currentPage !== 1) {
      return (
        <li className="page-item">
          <a
            className="page-link"
            href="#"
            onClick={() => {
              this.setState({
                currentPage: this.state.currentPage - 1,
              });
            }}
          >
            Previous
          </a>
        </li>
      );
    }
  }

  isLastPage(posts) {
    if (
      this.state.currentPage !==
        Math.ceil(this.state.posts.length / this.state.postsPerPage) &&
      posts.length > this.state.postsPerPage
    ) {
      return (
        <li className="page-item">
          <a
            className="page-link"
            href="#!"
            onClick={() => {
              this.setState({
                currentPage: this.state.currentPage + 1,
              });
            }}
          >
            Next
          </a>
        </li>
      );
    }
  }

  likeOrNot(likes) {
    const likesObject = Object.fromEntries(likes);
    if (Object.values(likesObject).includes(parseInt(window.django.user.id))) {
      return <span className="hearts">&hearts;</span>;
    } else {
      return <span className="hearts">&#9825;</span>;
    }
  }

  // Update input field as the user types
  updateText = (event) => {
    if (event.target.value != "\n") {
      this.setState({
        text: event.target.value,
      });
    }
    this.setState({
      helpText: event.target.value.length > 0 ? 'Press "Enter" to post' : "",
    });
  };

  // Change message value
  changeMessage(message, className) {
    this.setState({
      message: message,
      messageClass: `alert alert-hide ${className}`,
    });
  }

  // Reset message
  resetMessage() {
    this.setState({
      message: "",
      messageClass: ``,
    });
  }

  // Handler to prevent form from submitting
  submitHandler(e) {
    e.preventDefault();
  }

  inputKeyPress = (event) => {
    if (event.key === "Enter") {
      this.resetMessage();
      // Submit the new post when Enter is pressed
      fetch("/new", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
          text: this.state.text,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          // Display any error or success messages
          if (result["error"]) {
            this.changeMessage(result["error"], "alert-danger");
          } else {
            this.changeMessage(result["message"], "alert-success");
          }
        });
      // Clear the input box
      this.setState((state) => ({
        text: "",
      }));
      this.getNewPosts();
    }
  };

  getNewPosts() {
    fetch("/posts")
      .then((response) => response.json())
      .then((posts) => this.setState({ posts: posts }));
  }
}

// Parse the website's cookies and return a cleaned version.
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

ReactDOM.render(<App />, document.querySelector("#app"));
