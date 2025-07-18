import { Spinner, TextInput } from '@inkjs/ui';
import {Text, Box} from 'ink';
import { useState, useEffect } from 'react';
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

export const GitHub = () => {
    const [user, setUser] = useState<User | null>(null);
    const [commits, setCommits] = useState<Commit[]>([]);
    const [loading, setLoading] = useState(true);

    const [response, setResponse] = useState({
        userName: ''
    });

    useEffect(() => {
        setLoading(true);

    const token = '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'; // Replace with your token

    fetch(`https://api.github.com/users/${response.userName}/events`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => response.json())
    .then((data: any) => {
        const commits = data.map((event: any) => {
            return {
                repository: event.repo.name,
                timestamp: event.created_at,
                message: event.payload.commits?.map((commit: any) => commit.message)||[],
                author: event.actor.login
            };
        });
       
        setCommits(commits);
        setLoading(false);
    })
    .catch(error => {
        console.log(error);
        setLoading(false);
    });

    fetch(`https://api.github.com/users/${response.userName}`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => response.json())
    .then((data: any) => {
        const user: User = {
            email: data.email,
            username: data.login,
            bio: data.bio,
            commits: commits,
            followers: data.followers,
            following: data.following,
            repositories: data.public_repos
        };
        setUser(user);
    })
    .catch(error => {
        console.log(error);
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
            {user && (
                <Box 
                    flexDirection="column" 
                    borderStyle="round" 
                    borderColor="green" 
                    marginBottom={1}
                >
                    <Text color="blue" italic bold>User Info</Text>
                    <Box marginBottom={1} />
                    <Text color="blue"><Text color="green">Username:</Text> {user.username}</Text>
                    <Text color="blue"><Text color="green">Followers:</Text> {user.followers}</Text>
                    <Text color="blue"><Text color="green">Following:</Text> {user.following}</Text>
                    <Text color="blue"><Text color="green">Repositories:</Text> {user.repositories}</Text>
                    <Text color="blue"><Text color="green">Email:</Text> {user.email}</Text>
                    <Text color="blue"><Text color="green">Bio:</Text> {user.bio}</Text>
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
                </Box>
            )}
		</Box>
	)
}