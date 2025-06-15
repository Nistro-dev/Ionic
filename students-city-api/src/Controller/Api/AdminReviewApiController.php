<?php
// src/Controller/Api/AdminReviewApiController.php

namespace App\Controller\Api;

use App\Entity\Review;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class AdminReviewApiController extends AbstractController
{
    #[Route('/api/admin/reviews/{id}', name: 'api_admin_review_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $review = $em->getRepository(Review::class)->find($id);
        if (!$review) return $this->json(['success' => false, 'message' => 'Avis non trouvé'], 404);
        $em->remove($review);
        $em->flush();
        return $this->json(['success' => true]);
    }

    #[Route('/api/reviews/', name: 'api_reviews_all', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function all(EntityManagerInterface $em): JsonResponse
    {
        $reviews = $em->getRepository(Review::class)->findAll();
        $data = [];
        foreach ($reviews as $review) {
            $data[] = [
                'id' => $review->getId(),
                'place' => [
                    'id' => $review->getPlace()->getId(),
                    'name' => $review->getPlace()->getName(),
                ],
                'user' => [
                    'id' => $review->getUser()->getId(),
                    'pseudo' => $review->getUser()->getPseudo(),
                ],
                'commentaire' => $review->getCommentaire(),
                'rating' => $review->getRating(),
                'createAt' => $review->getCreateAt()?->format('Y-m-d H:i:s'),
            ];
        }
        return $this->json($data);
    }
}