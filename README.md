## Intro
__DerTutor__ – markdown app for learning English and German.

## License
MIT


## Run docker
```cmd
>>> docker-compose -f docker-compose-dev.yml up --build
```

## Run pgadmin
Enter database address: 'dertutor-pg' – container name, not localhost

## Migrations
Generate migration file:
```cmd
>>> uv run alembic revision --autogenerate -m 'creating tables'
>>> uv run alembic revision --autogenerate -m 'creating foreign_constraints'
```

Apply migration
```cmd
>>> uv run alembic upgrade head
```

Roolback all migrations
```cmd
>>> uv run alembic downgrade base  
```
