import {postFilePaths} from '../../utils/mdx-utils';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import {getSecrets, getSecretsForBuild} from '@netlify/functions';
import {Octokit} from 'octokit';

export default function PostPage({params}) {
  return (
    <Layout>
      <Header name={params.slug} />
    </Layout>
  );
}

export const getStaticProps = async ({params}) => {
  const secrets = await getSecretsForBuild();
  const token = secrets.gitHub?.bearerToken;

  if (!token) {
    return {
      revalidate: 10, // In seconds
      props: {
        params: {slug: 'no token'},
      },
    };
  }

  const octokit = new Octokit({auth: token});
  const issue = await octokit.rest.issues.get({
    owner: 'onegraph',
    repo: 'onegraph-changelog',
    issue_number: parseInt(params.slug, 10),
  });

  try {
    return {
      revalidate: 10, // In seconds
      props: {
        params: {
          slug: issue?.data?.title || params.slug,
        },
      },
    };
  } catch (e) {
    console.error('raised exception', e);
  }
};

export const getStaticPaths = async () => {
  const paths = postFilePaths
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ''))
    // Map the path into the static paths object required by Next.js
    .map((slug) => ({params: {slug}}));

  return {
    // paths: [],
    paths,
    fallback: 'blocking',
  };
};
