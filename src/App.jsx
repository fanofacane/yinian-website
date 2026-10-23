import Layout from './components/Layout.jsx';
import { matchRoute } from './routes.js';

export default function App({ path }) {
  const route = matchRoute(path);
  const Page = route.component;
  return (
    <Layout path={route.path}>
      <Page />
    </Layout>
  );
}
