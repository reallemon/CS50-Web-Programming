// CSRF token for use in Fetch requests
// Import by including fetch header of: 'X-CSRFToken': csrftoken
var csrftoken = getCookie('csrftoken');

// CSRF token for use as component inside forms
// Include at top of form with <CSRFToken />
const CSRFToken = () => {
    return (
        <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken} />
    );
};
class App extends React.Component {

    render() {
        return (
            <NewPost />
        )
    };
}

class NewPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            message: '',
            helpText: '',
            messageClass: '',
            placeholder: ''
        }
    };

    render() {
        return (
            <div className="row">
                <div className="col-sm-12">
                    <form onSubmit={this.submitHandler}>
                        <div className="form-group">
                            <div className={this.state.messageClass} role="alert">{this.state.message}</div>
                            <textarea className='form-control' value={this.state.text} onChange={this.updateText} onKeyPress={this.inputKeyPress} aria-describedby="newPostHelp" placeholder='New post...' />
                            <small id="newPostHelp" className="form-text text-muted">{this.state.helpText}</small>
                        </div>
                    </form>
                </div>
            </div>
        )
    };

    // Update input field as the user types
    updateText = (event) => {
        if (event.target.value != '\n') {
            this.setState({
                text: event.target.value
            })
        }
        this.setState({ helpText: event.target.value.length > 0 ? 'Press "Enter" to post' : ''})
    };

    // Change message value
    changeMessage(message, className) {
        this.setState({
            message: message,
            messageClass: `alert alert-hide ${className}`
        })
    }

    // Reset message
    resetMessage() {
        this.setState({
            message: '',
            messageClass: ``
        })
    }

    // Handler to prevent form from submitting
    submitHandler(e) {
        e.preventDefault();
    }

    inputKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.resetMessage();
            // Submit the new post when Enter is pressed
            fetch('/new', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    text: this.state.text
                })
            })
            .then(response => response.json())
            .then(result => {
                // Display any error or success messages
                if (result['error']) {
                    this.changeMessage(result['error'], 'alert-danger')
                } else {
                    this.changeMessage(result['message'], 'alert-success')
                }
            })
            // Clear the input box
            this.setState(state => ({
                text: ''
            }))
        }
    }
}

// Parse the website's cookies and return a cleaned version. 
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

ReactDOM.render(<App />, document.querySelector('#app'))