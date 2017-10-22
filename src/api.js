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
  groupName,
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
  const getBannded = () =>
    instance.get('users.get', {
      params: {
        ...baseParams,
        user_ids: [...bannded].join(','),
      },
    });

  const blockPost = ({ id, owner_id, ...rest }) =>
    delay(Number(delayTime) * 1000)
      .then(() => shouldBan({ id, owner_id, ...rest }))
      .then(res => (res ? Promise.resolve() : Promise.reject()))
      .then(() =>
        instance.get('wall.reportPost', {
          params: {
            ...baseParams,
            reason,
            owner_id,
          },
        }),
      )
      .then((el) => {
        updateState({ id, owner_id, ...rest });
      });
  const getItems = () =>
    instance
      .get('wall.get', {
        params: {
          ...baseParams,
          count: Number(banFirst),
          offset: 0,
          domain: groupName,
        },
      })
      .then(el => el.data.response.items);
  const blockItems = () =>
    getItems().then((items) => {
      const res = items.reduce(
        (acc, post) =>
          acc.then(() =>
            blockPost({ ...post, token, groupName })
              .then((el) => {
                bannded.add(post);
              })
              .catch(console.error),
          ),
        Promise.resolve(),
      );
      return res.then(() => [...bannded]);
    });
  return {
    start: blockItems,
    getBannded,
  };
};
