import React from 'react';
import moment from 'moment';
// material-ui
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

const Snshandle = ({ post }) => {
  return (
    <>
    {!post.snshandle
      ? <Typography variant="body2" color="textSecondary" component="div">{moment(post.updated_at).format('YYYY/MM/DD ddd HH:mm')} by {post.author}</Typography>
      : post.snshandle[0] === "@" 
        ? (<Typography variant="body2" color="textSecondary" component="div">
          {moment(post.updated_at).format('YYYY/MM/DD ddd HH:mm')} by {post.author} (
            <Link href={"https://twitter.com/" + post.snshandle} target="_about"  style={{ color: "#1DA1F2" }} >{post.snshandle}</Link>)
          </Typography>)
        : (<Typography variant="body2" color="textSecondary" component="div">
        {moment(post.updated_at).format('YYYY/MM/DD ddd HH:mm')} by {post.author} (
          <Link href={"https://twitter.com/" + post.snshandle} target="_about"  style={{ color: "#1DA1F2" }} >@{post.snshandle}</Link>)
        </Typography>)
    }
    </>
  );
}

export default Snshandle;
