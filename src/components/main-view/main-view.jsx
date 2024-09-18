import { useState, useEffect } from 'react';
import { MovieCard } from '../movie-card/movie-card';
import { MovieView } from '../movie-view/movie-view';
import { LoginView } from '../login-view/login-view';
import { SignupView } from '../signup-view/signup-view';
import { NavigationBar } from '../navigation-bar/navigation-bar';
import { ProfileView } from '../profile-view/profile-view';
import { Row, Col, FormControl } from 'react-bootstrap';
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	useNavigate,
} from 'react-router-dom';
import axios from 'axios';

export const MainView = () => {
	const [movies, setMovies] = useState([]);
	const [filteredMovies, setFilteredMovies] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const storedUser = JSON.parse(localStorage.getItem('user'));
	const storedToken = localStorage.getItem('token');
	const [user, setUser] = useState(storedUser ? storedUser : null);
	const [token, setToken] = useState(storedToken ? storedToken : null);

	async function getUser() {
		try {
			const response = await fetch(
				`https://duncanflixapi-2df251ca79e4.herokuapp.com/users/${user.Username}`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			setUser(data);
		} catch (error) {
			console.log(error);
		}
	}

	async function handleAddToFavorites(movie) {
		try {
			const response = await fetch(
				`https://duncanflixapi-2df251ca79e4.herokuapp.com/users/${user.Username}/movies/${movie._id}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + token,
					},
				}
			);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return getUser();
		} catch (error) {
			console.log(error);
		}
	}

	async function handleRemoveFromFavorites(movie) {
		return await axios
			.delete(
				`https://duncanflixapi-2df251ca79e4.herokuapp.com/users/${user.Username}/${movie._id}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			)
			.then((response) => {
				return getUser();
			})
			.catch((error) => {
				console.log(error);
			});
	}

	async function fetchMovies(token) {
		try {
			const fetchedData = await fetch(
				'https://duncanflixapi-2df251ca79e4.herokuapp.com/movies',
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (!fetchedData.ok) {
				throw new Error(`HTTP error! status: ${fetchedData.status}`);
			}
			const jsonData = await fetchedData.json();
			const movies = jsonData.map((doc) => {
				return {
					_id: doc._id,
					title: doc.Title,
					description: doc.Description,
					genre: {
						name: doc.Genre.Name,
						description: doc.Genre.Description,
					},
					director: {
						name: doc.Director.Name,
						bio: doc.Director.Bio,
						birth: doc.Director.Birth,
					},
					imagepath: doc.ImagePath,
					actors: doc.Actors,
				};
			});
			setMovies(movies);
			setFilteredMovies(movies);
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		if (!token) return;

		getUser();
		fetchMovies(token);
	}, [token]);

	const handleSearch = (event) => {
		const query = event.target.value.toLowerCase();
		setSearchQuery(query);

		const filtered = movies.filter((movie) =>
			movie.title.toLowerCase().includes(query)
		);
		setFilteredMovies(filtered);
	};

	return (
		<BrowserRouter>
			<Row className='justify-content-md-center'>
				<NavigationBar
					user={user}
					onLoggedOut={() => {
						setUser(null);
						setToken(null);
						localStorage.clear();
						window.location.href = '/';
					}}
				/>
				<Routes>
					<Route
						path='/signup'
						element={
							!user ? (
								<Col className='mb-5' md={5}>
									<SignupView />
								</Col>
							) : (
								<Navigate to='/' />
							)
						}
					/>
					<Route
						path='/login'
						element={
							user ? (
								<Navigate to='/' />
							) : (
								<Col md={5}>
									<LoginView
										onLoggedIn={(user, token) => {
											setUser(user);
											setToken(token);
										}}
									/>
								</Col>
							)
						}
					/>
					<Route
						path='/movies/:movieId'
						element={
							!user ? (
								<Navigate to='/login' replace />
							) : movies.length === 0 ? (
								<Col>The list is empty!</Col>
							) : (
								<Col className='mb-5' md={8}>
									<MovieView movies={movies} />
								</Col>
							)
						}
					/>
					<Route
						path='/'
						element={
							!user ? (
								<Navigate to='/login' replace />
							) : movies.length === 0 ? (
								<Col>The list is empty!</Col>
							) : (
								<>
									<Row className='justify-content-md-center'>
										<Col md={6} className='d-flex justify-content-center'>
											{/* Add search input */}
											<FormControl
												type='text'
												placeholder='Search for a movie...'
												value={searchQuery}
												onChange={handleSearch}
												className='mb-3 mt-3'
												style={{ width: '100%' }} // Ensures the FormControl fits within the smaller column
											/>
										</Col>
									</Row>
									{filteredMovies.map((movie) => (
										<Col className='mb-4' key={movie._id} md={3}>
											<MovieCard
												user={user}
												movie={movie}
												handleAddToFavorites={() => handleAddToFavorites(movie)}
												handleRemoveFromFavorites={() =>
													handleRemoveFromFavorites(movie)
												}
											/>
										</Col>
									))}
								</>
							)
						}
					/>
					<Route
						path='/profile'
						element={
							<ProfileView
								user={user}
								token={token}
								movies={movies}
								handleAddToFavorites={handleAddToFavorites}
								handleRemoveFromFavorites={handleRemoveFromFavorites}
							/>
						}
					/>
					actors
				</Routes>
			</Row>
		</BrowserRouter>
	);
};

export default MainView;
