import Header from '../../../components/Header';
import Layout from '../../../components/Layout';
import {getSecrets, getSecretsForBuild} from '@netlify/functions';
import {Octokit} from 'octokit';

export default function PostPage({params}) {
  return (
    <Layout>
      <Header name={params.slug} />
    </Layout>
  );
}

export const getServerSideProps = async (context) => {
  try {
    console.log('headers', context.req.headers);
    const secrets = await getSecrets(context.req);

    const token = secrets.gitHub?.bearerToken;

    if (!token) {
      return {props: {params: {slug: 'idk'}}};
    }

    const octokit = new Octokit({auth: token});
    const issue = await octokit.rest.issues.get({
      owner: 'onegraph',
      repo: 'onegraph-changelog',
      issue_number: parseInt(context.params.slug, 10),
    });

    return {
      props: {
        params: {
          slug: issue?.data?.title || context.params.slug,
        },
      },
    };
  } catch (e) {
    console.error('raised exception', e);
    return {props: {params: {slug: 'error'}}};
  }
};
