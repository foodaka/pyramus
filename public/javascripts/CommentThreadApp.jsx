var scriptDOM = document.getElementById('comment-thread-script');
var postId = scriptDOM.getAttribute('postId');
var commentsGETURL = '/comments/' + postId;
var postGETURL = '/posts/' + postId;

var pollInterval = 20 * 1000;

var CommentThreadApp = React.createClass({
    getInitialState: function() {
        return {
            post: {},
            comments: []
        };
    },
    updateCommentsAfterUpvote: function(commentId, isUpvoting) {
        var updatedComments = findAndUpdateUpvoted(this.state.comments, commentId, isUpvoting);
        this.setState({comments: updatedComments});
    },
    updateAfterUpvote: function(commentId, isUpvoting) {
        this.updateCommentsAfterUpvote(commentId, isUpvoting);

        var ajaxURL = '/comments/'
        if (isUpvoting) {
            ajaxURL += 'upvote/' + commentId;
        } else {
            ajaxURL += 'remove-upvote/' + commentId;
        }

        $.ajax({
            type: 'POST',
            url: ajaxURL
        });
    },
    handleUpvote: function(commentId) {
        console.log(commentId);
        this.updateAfterUpvote(commentId, true);
    },
    handleRemoveUpvote: function(commentId) {
        console.log(commentId);
        this.updateAfterUpvote(commentId, false);
    },
    handleReply: function(parentId, message) {
        $.ajax({
            url: '/comments/reply/' + postId,
            dataType: 'text',
            type: 'POST',
            data: {
                message: message,
                parent_id: parentId
            },
            success: function(data) {
                this.loadCommentsFromServer();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                this.setState({comments: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    loadPostFromServer: function() {
        $.ajax({
            url: this.props.GETPostURL,
            dataType: 'json',
            success: function(data) {
                this.setState({post: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        this.loadPostFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
        setInterval(this.loadPostFromServer, this.props.pollInterval);
    },
    handleUpvote: function(postId) {
        console.log(postId);
    },
    handleRemoveUpvote: function(postId) {
        console.log(postId);
    },
    render: function() {
        var CommentThreadProps = {
            handleReply: this.handleReply,
            comments: this.state.comments,
            usernameRoute: this.props.usernameRoute,
            upvoteImageURL: this.props.upvoteImageURL,
            upvotedImageURL: this.props.upvotedImageURL,
            handleUpvote: this.handleUpvote,
            handleRemoveUpvote: this.handleRemoveUpvote
        };

        console.log(this.state.post);
        var PostProps = {
            handleUpvote: this.handleUpvote,
            handleRemoveUpvote: this.handleRemoveUpvote,
            post: this.state.post,
            upvoteImageURL: '/images/upvote.svg',
            upvotedImageURL: '/images/upvoted.svg',
            commentsURL: '/comments/'
        };

        return (
            <div className="comment-thread-app">
                <Post {...PostProps} />
                <CommentForm
                    onCommentSubmit={this.handleReply}
                />
                <CommentThread {...CommentThreadProps} />
            </div>
        );
    }
});

var CommentForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();

        var message = React.findDOMNode(this.refs.message).value.trim();

        if (!message) {
            return;
        }

        this.props.onCommentSubmit(null, message);
        React.findDOMNode(this.refs.message).value = '';
    },
    render: function() {
        return (
            <form className='new-comment-form' onSubmit={this.handleSubmit}>
                <textarea type='text' ref='message' maxLength='300' placeholder='Reply to thread...' className="thread-reply-textarea"/>
                <br />
                <input type="submit" value="reply" />
            </form>
        );
    }
});

var CommentThread = React.createClass({
     propTypes: {
        comments           : React.PropTypes.array,
        handleUpvote       : React.PropTypes.func.isRequired,
        handleRemoveUpvote : React.PropTypes.func.isRequired,
        handleReply        : React.PropTypes.func.isRequired,
        upvoteImageURL     : React.PropTypes.string.isRequired,
        upvotedImageURL    : React.PropTypes.string.isRequired,
        usernameRoute      : React.PropTypes.string.isRequired,
    },
    render: function() {
        var props = this.props;

        var CommentProps = {
            comment: {},
            handleUpvote: props.handleUpvote,
            handleRemoveUpvote: props.handleRemoveUpvote,
            handleReply: props.handleReply,
            upvoteImageURL: props.upvoteImageURL,
            upvotedImageURL: props.upvotedImageURL,
            usernameRoute: props.usernameRoute
        };

        var comments = this.props.comments.map(function(comment) {
            CommentProps.comment = comment;

            return (
                <Comment {...CommentProps} />
            );
        });

        return (
            <ul className="comment-thread">
                {comments}
            </ul>
        );
    }
});

React.render(
    <CommentThreadApp
        url={commentsGETURL}
        GETPostURL={postGETURL}
        pollInterval={pollInterval}
        usernameRoute='/u/'
        upvoteImageURL='/images/upvote_comment.svg'
        upvotedImageURL='/images/upvoted_comment.svg'
    />,
    document.getElementById("react-comment-app-mount")
);
