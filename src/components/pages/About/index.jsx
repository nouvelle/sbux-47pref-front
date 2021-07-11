import React from 'react';
// material-ui
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import theme from '../../../theme';
import '../../../index.css'

const useStyles = makeStyles(() => ({
  container: {
    height: '87vh',
    padding: theme.spacing(3),
    backgroundImage: 'url("/img/about.jpg")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: "center center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    height: "100%",
    overflowY: "auto",
    boxSizing: "border-box",
    padding: theme.spacing(3),
    background: "rgba(255, 255, 255, 0.8)",
    boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
  }
}));

const About = () => {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.container}>
      <div className={classes.card}>
      <Typography variant="h5" component="h2" color="secondary">このサイトについて</Typography>
      <Typography variant="subtitle1" component="h2">
        2021年6月30日から8月3日までの期間限定で始まった STARBUCKS JAPAN 47JIMOTO フラペチーノ。<br/>
        この期間中、各都道府県のパートナーさんが思考を凝らして作成した特別フラペチーノが販売されます！<br/>
        しかし、それぞれのフラペチーノはその都道府県でしか飲むことができません...<br/>
        本当は全都道府県周りたいけど、私1人では周れないので、みなさんのお力をお借りして行った気分になりたい！<br/>
        ...ということで作成しました。<br/>
        是非みなさんが飲んだフラペチーノを投稿してください！
      </Typography>
      <br/>
      <Typography variant="h5" component="h2" color="secondary">不具合・お問い合わせ等</Typography>
      <Typography variant="subtitle1" component="h2">
        めちゃ短期間で作成したので不具合などあるかもしれません。。<br/>
        - 何かおかしな挙動を発見した方<br/>
        - 追加機能要望がある方<br/>
        - 何かコメントしたい方<br/>
        <br/>
        是非ご連絡ください！<a href="https://twitter.com/e_chai" target="_about">Twitter の DM</a> で受け付けています。<br/>
        不具合・機能要望などのご意見は、<a href="https://github.com/nouvelle/sbux-47pref" target="_about">GitHub の Issues </a>にあげていただいても構いません。<br/>
        コードのコントリビューションも喜んでお待ちしております ☕️<br/>
      </Typography>
      <br />
      <Typography variant="h5" component="h2" color="secondary">お断り</Typography>
      <Typography variant="subtitle1" component="h2">
        関係のない写真が投稿されているのを発見した場合、こちらで投稿を削除させていただく場合があります。<br />
        あらかじめご了承ください。<br />
      </Typography>
      </div>
    </Container>
  );
}

export default About;
