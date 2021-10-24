import React from 'react';

class CommentBox extends React.Component {

    addComment = () => {
        if (!this.props.codeMode) {

            let allComments = this.updateCommentsArray();

            this.props.addComment(allComments);

            return;
        }
    }

    updateCommentsArray = () => {
        let allComments = this.props.comments;
        let comment = { nr: 1, text: "Min kommentar" };

        if (allComments.length > 0) {
            comment.nr = allComments.at(-1).nr + 1;
        }

        allComments.push(comment);

        return allComments;
    }

    toggleShowComments = () => {
        // öga utan överkryssning: visibility
        if (!this.props.codeMode) {
            this.props.toggleShowComments();
        }
    }

    render() {
        let inactive = "";
        if (this.props.codeMode) {
            inactive = "inactive-icon";
        }
        return (
            <div className="flex-column">
                <p className="comment-title">Comments</p>
                <div className="comment-wrapper flex-row">
                <>
                    <p
                        className={`material-icons comment-icon ${inactive}`}
                        onClick={this.toggleShowComments}>visibility_off</p>
                    <p
                        className={`material-icons comment-icon ${inactive}`}
                        onClick={this.addComment}>add</p>
                </>
                </div>
            </div>
        );
    }
}

export default CommentBox;
