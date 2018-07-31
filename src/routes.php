<?php

use Slim\Http\Request;
use Slim\Http\Response;

// Routes

DEFINE('TODO_FILE', 'todos/todo.txt');
DEFINE('DONE_FILE', 'todos/done.txt');

$app->get('/', function (Request $request, Response $response, array $args) {
    return $this->renderer->render($response, 'index.phtml', $args);
});

$app->get('/done', function (Request $request, Response $response, array $args) {

    $todoString = file_get_contents(DONE_FILE);
    $tmp = explode(PHP_EOL, $todoString);

    foreach($tmp as $todo) {
        $todos[] = explode('|',$todo);
    }
    $args['done'] = $todos;

    return $this->renderer->render($response, 'done.phtml', $args);
});

$app->post('/api/todo', function (Request $request, Response $response, array $args) {

    $parsedBody = $request->getParsedBody();

    $data = ['success' => false, 'msg'=>'Unexpected error'];

    if (!empty($parsedBody['todo'])) {
        $date = date('Y-m-d H:i:s');
        file_put_contents(TODO_FILE, PHP_EOL . $date . '|' . $parsedBody['todo'], FILE_APPEND);
        $data = ['success' => true, 'msg'=>'Todo Added'];
    }

    if (!empty($parsedBody['done'])) {
        $todoString = file_get_contents(TODO_FILE);
        $tmp = explode(PHP_EOL, $todoString);
        $todos = [];


        foreach($tmp as $todo) {
            $todoArr = explode('|',$todo);
            if ($todoArr[0] == $parsedBody['done']) {
                $doneTodo = $todo;
            } else {
                $todos[] = $todo;
            }
        }

        file_put_contents(DONE_FILE, PHP_EOL . $doneTodo, FILE_APPEND);

        $todoString = implode(PHP_EOL, $todos);

        file_put_contents(TODO_FILE, $todoString);

        $data = ['success' => true, 'msg'=>'Todo Updated'];
    }

    return $response->withJson($data);
});

$app->get('/api/todo', function (Request $request, Response $response, array $args) {

    $todoString = file_get_contents(TODO_FILE);
    $tmp = explode(PHP_EOL, $todoString);

    foreach($tmp as $todo) {
        $todos[] = explode('|',$todo);
    }

    $data = ['success' => true, 'msg'=>'', 'data' => $todos];
    return $response->withJson($data);
});

$app->get('/api/done', function (Request $request, Response $response, array $args) {

    $todoString = file_get_contents(DONE_FILE);
    $tmp = explode(PHP_EOL, $todoString);

    foreach($tmp as $todo) {
        $todos[] = explode('|',$todo);
    }

    $data = ['success' => true, 'msg'=>'', 'data' => $todos];
    return $response->withJson($data);
});



