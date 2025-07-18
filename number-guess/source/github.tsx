import { Spinner, TextInput } from '@inkjs/ui';
import {Text, Box} from 'ink';
import { useState, useEffect } from 'react';
import { config } from "dotenv";
config({ path: '.env' });
interface Commit {
    repository: string;
    timestamp: string;
    message: string[];
    author: string;
}

interface User {
	username: string;
    commits: Commit[];
    followers: number;
    following: number;
    repositories: number;
    email: string;
    bio: string;
}

const initialUser: User = {
    username: '',
    commits: [],
    followers: 0,
    following: 0,
    repositories: 0,
    email: '',
    bio: ''
};

export const GitHub = () => {
    const [user, setUser] = useState<User>(initialUser);
    const [commits, setCommits] = useState<Commit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [response, setResponse] = useState({
        userName: ''
    });

    useEffect(() => {
        setLoading(true);

        const token = process.env['GITHUB_TOKEN']; // Replace with your token
        console.log(token);

        fetch(`https://api.github.com/users/${response.userName}/events`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        })
        .then(response => response.json())
        .then((data: any) => {
            if (data.status && data.status === '401') {
                setLoading(false);
                setError('Unauthorized');
                setUser(initialUser);
                setCommits([]);
                return;
            }
            if (data.status && data.status === '404') {
                setLoading(false);
                setError('Not Found');
                setUser(initialUser);
                setCommits([]);
                return;
            }

            if(data.length === 0) {
                setLoading(false);
                setUser(initialUser);
                setCommits([]);
                setError('No data');
                return;
            }
            const commits = data?.map((event: any) => {
                return {
                    repository: event.repo.name,
                    timestamp: event.created_at,
                    message: event.payload.commits?.map((commit: any) => commit.message)||[],
                    author: event.actor.login
                };
            })||[];
            setError(null);
            setCommits(commits);
            setLoading(false);
        })
    .catch(error => {
        setLoading(false);
        setError(error.message);
    });

    fetch(`https://api.github.com/users/${response.userName}`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => response.json())
    .then((data: any) => {
        if(data.status && data.status === '401') {
            setLoading(false);
            setUser(initialUser);
            setCommits([]);
            setError('Unauthorized');
            return;
        }
        if(data.status && data.status === '404') {
            setLoading(false);
            setUser(initialUser);
            setCommits([]);
            setError('Not Found');
            return;
        }
        if(data.length === 0) {
            setLoading(false);
            setUser(initialUser);
            setCommits([]);
            setError('No data');
            return;
        }
        const user: User = {
            email: data.email,
            username: data.login,
            bio: data.bio,
            commits: commits,
            followers: data.followers,
            following: data.following,
            repositories: data.public_repos
        };
        setError(null);
        setUser(user);
    })
    .catch(error => {
        setLoading(false);
        setUser(initialUser);
        setCommits([]);
        setError(error.message);
    });
    }, [response]);
	return (
		<Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1}>
            <TextInput
        placeholder="Enter your username..."
        onSubmit={name => {
            setResponse({ userName: name });
        }}  
        />
			<Text bold color="blue">GitHub Stats</Text>

            {loading && <Spinner />}
            {error && <Text color="red">{error}</Text>}
            {user && (
                <Box 
                    flexDirection="column" 
                    borderStyle="round" 
                    borderColor="green" 
                    marginBottom={1}
                >
                    <Text color="blue" italic bold>User Info</Text>
                    <Box marginBottom={1} />
                    {user && (
                        <Box flexDirection="column">
                        <Text color="blue"><Text color="green">Username:</Text> {user.username}</Text>
                        <Text color="blue"><Text color="green">Email:</Text> {user.email}</Text>
                        <Text color="blue"><Text color="green">Bio:</Text> {user.bio}</Text>
                        <Text color="blue"><Text color="green">Repositories:</Text> {user.repositories}</Text>
                        <Text color="blue"><Text color="green">Followers:</Text> {user.followers}</Text>
                        <Text color="blue"><Text color="green">Following:</Text> {user.following}</Text>
                        </Box>
                    )}
                </Box>
            )}  
            {commits.length > 0 && (
                <Box 
                    flexDirection="column" 
                    borderStyle="round" 
                    borderColor="green" 
                    padding={1}
                    paddingTop={0}
                    marginBottom={1}
                >
                    <Text bold color="green">Commits</Text>
                    <Box marginBottom={1} />
                    {commits.map((commit, index) => (
                        <Box 
                            flexDirection="column" 
                            key={index}
                            marginBottom={1}
                        >
                            <Text color="blue"><Text color="green">Message:</Text> {commit.message}</Text>
                            <Text color="green">@{commit.author}</Text>
                            <Text>{commit.timestamp}</Text>
                        </Box>
                    ))}
                    {commits.length === 0 && (
                        <Text color="blue"><Text color="green">No commits found</Text></Text>
                    )}
                </Box>
            )}
		</Box>
	)
}