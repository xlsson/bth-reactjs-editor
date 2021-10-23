import React from 'react';

class CommentBox extends React.Component {

    addComment = () => {
        if (!this.props.codeMode) {
            let comments = this.props.comments;
            const content = this.props.content;
            let position = this.props.position;
            let comment = {
                nr: 1,
                text: "Text"
            };

            if (comments.length > 0) {
                comment.nr = comments.at(-1).nr + 1;
            }

            comments.push(comment);

            const commentHtml = `<span class="comment" hidden="true"> ${comment.nr} </span>`;

            let newContent;

            let contentWithoutHtml = content.replace(/<\/?[^>]+(>|$)/g, "");

            if (position === contentWithoutHtml.length) {
                newContent = content + commentHtml;
                this.props.addComment(newContent, comments);
                return;
            }

            // Calculate the length of the HTML tags in the text before the comment
            // and add it to position
            let before = content.substring(0, position);
            let withoutHtml = before.replace(/<\/?[^>]+(>|$)/g, "");
            let htmlLength = before.length - withoutHtml.length;
            position += htmlLength;

            // Slice out the first part again with the new offset
            before = content.substring(0, position);

            let after = content.substring(position);

            newContent = before + comment + after;

            this.props.addComment(newContent, comments);
        }
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
