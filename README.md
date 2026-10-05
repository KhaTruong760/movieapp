# movieapp
A Movie Website

## Regenerating pickle files

The recommender needs `backend/movies_list.pkl` and `backend/similarity.pkl`.
These are derived artifacts and not committed (see `.gitignore`). To build them:

```bash
cd backend
jupyter nbconvert --to notebook --execute recommender.ipynb --output recommender.executed.ipynb
```

Or open `backend/recommender.ipynb` and run all cells. The last cells call
`pickle.dump(...)` into `movies_list.pkl` and `similarity.pkl` using
`top10K-TMDB-movies.csv` as input.
