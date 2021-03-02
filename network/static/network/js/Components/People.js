class NetworkUser extends HTMLElement {
  set userData(data) {
    this._id = data.id;
    this._fullname = data.fullname;
    this._email = data.email;

    this.render();
  }

  render() {}
}

customElements.define("network-user", NetworkUser);
