import React from 'react';

class CommentBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentComment: ''
        };

    }

    addComment = () => {
        if (this.props.codeMode) { return; };

        if (this.state.currentComment.length === 0) {
            this.props.setFlashMessage({
                text: "Comment is empty, please enter text",
                type: "error"
            });
            return;
        };

        let allComments = this.addCommentToArray(this.state.currentComment);

        let commentId = allComments[allComments.length-1].nr;

        let commentTag = this.createCommentTag(commentId);

        this.props.editor.execCommand('mceInsertContent', false, commentTag);

        this.props.addCommentToDropDown(allComments);

        this.props.setFlashMessage({
            text: "Comment was added",
            type: "ok"
        });

        this.setState({ currentComment: '' });

        return;
    }

    createCommentTag = (commentId) => {
        let hidden = ``;
        if (this.props.commentsAreHidden) { hidden = `hidden="true"`; }

        let commentTag = `
         <span class="comment" id="comment${commentId}" style="color: #f00;" ${hidden}>
        [${commentId}]</span> `;

        return commentTag;
    }

    addCommentToArray = (commentText) => {
        let allComments = this.props.comments;
        let comment = { nr: 1, text: commentText };

        if (allComments.length > 0) {
            comment.nr = allComments[allComments.length-1].nr + 1;
        }

        allComments.push(comment);

        return allComments;
    }

    toggleShowComments = () => {
        if (!this.props.codeMode) {
            this.props.toggleShowComments();
        }
    }

    handleCommentChange = (e) => {
        let commentText = e.target.value;
        this.setState({
            currentComment: commentText
        });
    }

    handleSelectClick = (e) => {
        this.props.cleanUpComments();
    }

    render() {
        let inactiveIcon = "";
        let dropdownDisabled = false;
        let inputDisabled = false;
        if (this.props.codeMode) {
            inactiveIcon = "inactive-icon";
            dropdownDisabled = true;
            inputDisabled = true;
        }

        if (this.props.comments.length === 0) {
            dropdownDisabled = true;
        }

        let eyeIcon = "visibility_off";
        let labelShowHide = "Hide";
        if (this.props.commentsAreHidden) {
            labelShowHide = "Show";
            eyeIcon = "visibility";
        }

        return (
            <>
            <div className="flex-column">
                <>
                <p className="comment-title">{labelShowHide}</p>
                <div className="comment-wrapper flex-row">
                    <p
                        className={`material-icons comment-icon ${inactiveIcon}`}
                        onClick={this.toggleShowComments}>{eyeIcon}</p>
                </div>
                </>
            </div>
            <div className="flex-column">
                <>
                <p className="comment-title">Add comment at cursor</p>
                <div className="comment-wrapper flex-row">
                <>
                    <input
                        className="input input-comment"
                        type="text"
                        maxlength="30"
                        value={this.state.currentComment}
                        onChange={this.handleCommentChange}
                        disabled={inputDisabled}>
                    </input>
                    <p
                        className={`material-icons comment-icon ${inactiveIcon}`}
                        onClick={this.addComment}>add</p>
                </>
                </div>
                </>
            </div>
            <div className="flex-column">
                <>
                <p className="comment-title">Comments list</p>
                <div className="comment-wrapper flex-row">
                    <select
                        className="select select-comment"
                        onClick={this.handleSelectClick}
                        disabled={dropdownDisabled}>
                        {this.props.comments.map((comment, i) => (
                            <option
                                key={i}
                                value={comment.nr}>
                                    [{comment.nr}] "{comment.text}"
                                </option>
                        ))}
                    </select>
                </div>
                </>
            </div>
            </>
        );
    }
}

export default CommentBox;
