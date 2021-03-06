import axios from 'axios';
import jsonp from 'axios-jsonp';

const getLink = ({ groupName, owner_id, id }) =>
  `https://vk.com/${groupName}?w=wall${owner_id}_${id}`;

const delay = time =>
  new Promise((r, j) => {
    setTimeout(() => {
      r();
    }, time);
  });

export const run = ({
  token,
  reason,
  shouldBan = () => true,
  updateState,
  catchError = console.error,
  groupsList,
  skipList,
  banFirst,
  delayAfterUserEnd,
  delay: delayTime,
}) => {
  const instance = axios.create({
    baseURL: 'https://api.vk.com/method/',
    adapter: jsonp,
  });
  const baseParams = {
    access_token: token,
    v: '5.53',
  };
  const bannded = new Set();

  //----
  const getUsers = ids =>
    instance.get('users.get', {
      params: {
        ...baseParams,
        user_ids: [...ids].join(','),
        fields: 'sex',
      },
    });

  const blockPost = ({ id, owner_id, ...rest }) =>
    delay(Number(delayTime) * 1000)
      .then(() => getUsers([rest.from_id]))
      .then(user => shouldBan({ id, owner_id, user: user.data.response[0], ...rest }))
      .then(res => (res ? Promise.resolve() : Promise.reject()))
      .then(() =>
        instance.get('wall.reportPost', {
          params: {
            ...baseParams,
            reason,
            owner_id,
            post_id: id,
          },
        }),
      )
      .then((el) => {
        updateState({ id, owner_id, ...rest });
      });
  const getItems = ({ value, type }) =>
    instance
      .get('wall.get', {
        params: {
          ...baseParams,
          count: Number(banFirst),
          offset: 0,
          [type]: value,
        },
      })
      .then(el => el.data.response.items);
  const blockItems = item =>
    getItems(item).then((items) => {
      const res = items.reduce(
        (acc, post) => acc.then(() => blockPost(post).then(el => bannded.add(post), console.error)),
        Promise.resolve(),
      );
      return res.then(() => [...bannded]);
    });

  const blockMultiple = list => list.reduce(
      (acc, el) => acc.then(() => blockItems(el), console.error),
      Promise.resolve(),
    );
  return {
    start: blockMultiple,
  };
};
