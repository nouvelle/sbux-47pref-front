import React from 'react';
// material-ui
import IconButton from '@material-ui/core/IconButton';
import TwitterIcon from '@material-ui/icons/Twitter';

const TwitterLink = ({ post }) => {
  return (
    <IconButton aria-label="share" className="buttonItem">
      <a href={"https://twitter.com/share?url=https://sbux-47pref.surge.sh/posts/" + post.id + "%0a%0a&text=" + post.pref.drink + "%0a&hashtags=STARBUCKS,47JIMOTOフラペチーノ"} target="_about">
        <TwitterIcon style={{ color: "#1DA1F2" }} />
      </a>
    </IconButton>
  );
}

export default TwitterLink;
