import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { MessageBoard } from './modules/MessageBoard'
import { BrowserRouter, Route } from 'react-router-dom'
/*
ReactDOM.render(<Input rows={4} defaultValue="this is a text area" />, document.getElementById('txtArea'));

const Msg = () => {
  return (
    <Comment
      author={"Han Solo"}
      content={
        <p>
          We supply a series of design principles, practical patterns and high quality design
          resources (Sketch and Axure), to help people create their product prototypes beautifully
          and efficiently.
        </p>
      }
      datetime={
        <Tooltip title={moment().format('YYYY-MM-DD HH:mm:ss')}>
          <span>{moment().fromNow()}</span>
        </Tooltip>
      }
    />
  );
}

ReactDOM.render(<Msg />, document.getElementById('msg'));
*/

// ReactDOM.render(<MessageBoard />, document.getElementById('app'));

ReactDOM.render((
  <BrowserRouter>
    <Route path="/messageBoard" component={MessageBoard}/>
  </BrowserRouter>
), document.getElementById('app'))