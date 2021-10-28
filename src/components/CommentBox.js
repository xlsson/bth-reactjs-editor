import React from 'react';

const textToImage = require('text-to-image');

/**
 * CommentBox component for handling comments
 *
 * @component
 * @member {object} state -          State members:
 * @member {string} currentComment - Represents the currently entered comment
 */
class CommentBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentComment: ''
        };

    }

    /**
     * Handle click on add comment icon:
     * Call addCommentToArray() to add comment to comment array.
     * Create a new comment id by getting the current highest id.
     * Call textToImage to create a data URI image.
     * Create a comment HTML tag with the image.
     * Call props.addCommentToDropDown() to add comment to dropdown array.
     * @async
     *
     */
    addComment = async () => {
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

        let image = await textToImage.generate(`${commentId}`, {
            maxWidth: 20,
            customHeight: 12,
            fontSize: 14,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            lineHeight: 0,
            margin: 2,
            bgColor: '#fff',
            textColor: '#2E6F95',
            verticalAlign: 'center'
        });

        let commentTag = this.createCommentTag(commentId, image);

        this.props.editor.execCommand('mceInsertContent', false, commentTag);

        this.props.addCommentToDropDown(allComments);

        this.props.setFlashMessage({
            text: "Comment was added",
            type: "ok"
        });

        this.setState({ currentComment: '' });

        return;
    }

    /**
     * Create a new comment tag.
     *
     * @param  {string} commentId   Unique comment id
     * @param  {string} image       Image as a data URI
     * @return {string} commentTag  Comment tag with the image
     *
     */
    createCommentTag = (commentId, image) => {
        let hidden = ``;
        if (this.props.commentsAreHidden) { hidden = `hidden="true"`; }

        let commentTag = `<img src="${image}" id="comment${commentId}" ${hidden}>`;

        return commentTag;
    }

    /**
     * Add a comment object to the props.comments array.
     *
     * @param  {string} commentText Comment text.
     * @return {array} allComments  Array of all comment objects.
     */
    addCommentToArray = (commentText) => {
        let allComments = this.props.comments;
        let comment = { nr: 1, text: commentText };

        if (allComments.length > 0) {
            comment.nr = allComments[allComments.length-1].nr + 1;
        }

        allComments.push(comment);

        return allComments;
    }

    /**
     * Toggle props.codeMode by calling props.toggleShowComments()
     */
    toggleShowComments = () => {
        if (!this.props.codeMode) {
            this.props.toggleShowComments();
        }
    }

    /**
     * Handle change in comment text field
     * @param  {object} e   Event object
     */
    handleCommentChange = (e) => {
        let commentText = e.target.value;
        this.setState({
            currentComment: commentText
        });
    }

    /**
     * Handle click on dropdown = call cleanUpComments() on every click
     * @param  {object} e   Event object
     */
    handleSelectClick = (e) => {
        this.props.cleanUpComments();
    }

    render() {
        let inactiveIcon = "";
        let dropdownDisabled = false;
        let inputDisabled = false;
        let eyeIcon = "visibility";
        let labelShowHide = "Hide";

        if (this.props.codeMode) {
            inactiveIcon = "inactive-icon";
            dropdownDisabled = true;
            inputDisabled = true;
        }

        if (this.props.comments.length === 0) {
            dropdownDisabled = true;
        }

        if (this.props.commentsAreHidden) {
            labelShowHide = "Show";
            eyeIcon = "visibility_off";
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
                        maxLength="30"
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
