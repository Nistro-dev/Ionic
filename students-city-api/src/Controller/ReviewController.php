<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ReviewController extends AbstractController
{
    #[Route('/reviews', name: 'reviews')]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function index(): Response
    {
        return $this->render('review/index.html.twig');
    }

    #[Route('/reviews/add', name: 'review_add')]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function add(): Response
    {
        return $this->render('review/add.html.twig');
    }
} 