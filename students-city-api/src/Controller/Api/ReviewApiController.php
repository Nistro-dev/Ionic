<?php

namespace App\Controller\Api;

use App\Entity\Review;
use App\Entity\Place;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ReviewApiController extends AbstractController
{
    #[Route('/api/reviews', name: 'api_reviews_list', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $reviews = $em->getRepository(Review::class)->findBy(['user' => $user]);
        $data = [];
        foreach ($reviews as $review) {
            $data[] = [
                'id' => $review->getId(),
                'place' => [
                    'id' => $review->getPlace()->getId(),
                    'name' => $review->getPlace()->getName(),
                ],
                'commentaire' => $review->getCommentaire(),
                'rating' => $review->getRating(),
                'createAt' => $review->getCreateAt()?->format('Y-m-d H:i:s'),
            ];
        }
        return $this->json($data);
    }

    #[Route('/api/reviews', name: 'api_review_create', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['place_id'], $data['commentaire'], $data['rating'])) {
            return $this->json(['success' => false, 'message' => 'Champs manquants'], 400);
        }

        $place = $em->getRepository(Place::class)->find($data['place_id']);
        if (!$place || strtolower($place->getStatut()) !== 'validé') {
            return $this->json(['success' => false, 'message' => 'Établissement non trouvé ou non validé'], 404);
        }

        // Empêcher plusieurs avis par utilisateur et établissement
        $existing = $em->getRepository(Review::class)->findOneBy([
            'user' => $user,
            'place' => $place
        ]);
        if ($existing) {
            return $this->json(['success' => false, 'message' => 'Vous avez déjà noté cet établissement.'], 400);
        }

        $review = new Review();
        $review->setUser($user);
        $review->setPlace($place);
        $review->setCommentaire($data['commentaire']);
        $review->setRating((int)$data['rating']);
        $review->setCreateAt(new \DateTimeImmutable());
        $review->setStatut('en attente');

        $em->persist($review);
        $em->flush();

        return $this->json(['success' => true, 'message' => 'Avis ajouté avec succès']);
    }

    #[Route('/api/reviews/{id}', name: 'api_review_update', methods: ['PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function update(Request $request, int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $review = $em->getRepository(Review::class)->find($id);

        if (!$review || $review->getUser() !== $user) {
            return $this->json(['success' => false, 'message' => 'Avis non trouvé ou non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (isset($data['commentaire'])) {
            $review->setCommentaire($data['commentaire']);
        }
        if (isset($data['rating'])) {
            $review->setRating((int)$data['rating']);
        }
        $em->flush();

        return $this->json(['success' => true, 'message' => 'Avis modifié avec succès']);
    }

    #[Route('/api/reviews/{id}', name: 'api_review_delete', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $review = $em->getRepository(Review::class)->find($id);

        if (!$review || $review->getUser() !== $user) {
            return $this->json(['success' => false, 'message' => 'Avis non trouvé ou non autorisé'], 403);
        }

        $em->remove($review);
        $em->flush();

        return $this->json(['success' => true, 'message' => 'Avis supprimé avec succès']);
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

    #[Route('/api/reviews/{id}', name: 'api_review_show', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function show(int $id, EntityManagerInterface $em): JsonResponse
    {
        $review = $em->getRepository(Review::class)->find($id);
        if (!$review) {
            return $this->json(['error' => 'Avis non trouvé'], 404);
        }
        return $this->json([
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
        ]);
    }  
} 